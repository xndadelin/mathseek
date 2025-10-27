import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

function sanitizeMathInput(s: string): string {
  return s
    .replace(/```[\s\S]*?```/g, (m) => m.replace(/```/g, '')) 
    .replace(/\\n/g, ' ')
    .replace(/\\\\/g, '\\')
    .replace(/\\differentialD\s*([a-zA-Z])/g, '\\,d$1') 
    .replace(/\\differentiald\s*([a-zA-Z])/gi, '\\,d$1')
    .replace(/\\,\s*d([a-zA-Z])/g, ' \\,d$1')
    .replace(/\s+/g, ' ')
    .trim();
}


export async function POST(request: NextRequest) {
    try {
        const { equation } = await request.json();
        const apiKey = process.env.DEEPSEEK_API_KEY;

        if(!apiKey) {
            throw new Error("DeepSeek API key is not configured yet.")
        }

        if(!equation || typeof equation !== 'string') {
            throw new Error('Invalid equation provided.')
        }

        const supabase = await createClient();

        const { data: {
            user
        } } = await supabase.auth.getUser();

        if(!user) {
            return NextResponse.json({
                error: 'you are not authenticated'
            })
        }

        const prompt = `
            You are a higly reliable math solving AI. I will provide you with a math problem in latex; you will return a STRICT JSON object only (no markdown, no codeblocks, no commentary).
    
            Input: Latex string.
            Output: JSON exactly matching this schema(double quotes, valid JSON, escape backslashed in latex):

            Provide the final answer in a JSON object with the following structure:
            {
                "problem_text": "sanitized echo of the input latex",
                "assumptions": "latex text stating any domain/variable/constraint assumptions.",
                "steps": [
                    {
                        "step": "short and concise latex description of the action/rule used.",
                        "expression": "show the resulting latex expression after applying each action or rule. write all sub-steps clearly and sequentially. do not jump directly to the final result of the step. break complex transformations into smaller, simpler sub-steps, and show each intermediate expression explicitly
                        "justification": "optional brief latex note naming the theorem/property/identity/rule used. e.g. (u-substitution)"
                    }
                ],
                "solution_set": ["each solution in latex format"],
                "final_answer": "one latex sentence concluding the result",
                "verification": {
                    "method": "latex description of how you checked",
                    "checks": [
                        {
                            "candidate": "latex for a candidate solution",
                            "residual_or_truth": "latex showing substitution or inequality truth",
                            "valid": "true/false BOOLEAN"
                        }
                    ],
                    "extraneous_solutions": ["list any discarded solutions in latex"]
                },
                "formats": {
                    "exact": "exact latex form (keep radicals/fractions, rationalize denominators)",
                    "approx_decimal": {
                        "value": "optional decimal approximation in latex",
                        "precision": "number of decimal places in latex"
                    },
                    "interval_notation": "if inequality/domain, interval notation in latex format with delimiters"
                },
                "notes": "optional latex remarks about special cases/branches/considerations"
            }
            Rules:
            - output must be a single json object (no code fences or markdown).
            - use pure latex only for math tokens (no surrounding $, $$, \( \)); if a field is math-only (like approx_decimal.value or interval_notation), wrap it in $...$ or $$...$$.
            - prefer exact and simplified symbolic forms; rationalize denominators; factor where natural.
            - state domain restrictions from denominators, logarithms, even roots, trig functions, etc., and remove any invalid roots.
            - if multiple solutions or branches exist, list them all in "solution_set".
            - for inequalities, provide solution in interval notation under "formats.interval_notation".
            - for indefinite integrals, include +C; for definite integrals, specify limits clearly.
            - if the input is an expression (not an equation), simplify or evaluate as requested by the text; clarify the aim in "assumptions".
            - if the problem is ambiguous, ill-posed, or not math, return { "error": "brief reason IN LATEX" }.
            - do not enclose full sentences entirely in latex; only embed math inline (e.g., "the solution is $x=1$").
            - never use \differentialD, \differentialdx, or any similar macro for differentials. always write the differential as \,dx (and similarly for dy, dz, etc.).
            - replace any occurrence of those macros or unicode differential symbols (ⅆ) with the plain \,d(variable).
            - when writing derivatives like d/dx, ensure you write \frac{d}{\,dx and never use \differentialD.
            - always sanitize the input expression before including it in "problem_text" to remove such issues.
            - put the sanitized input latex in the "problem_text" field after you sanitize it, and put the sanitized version

            Solve the following equation/problem(LATEX): ${sanitizeMathInput(equation)}.
        `;

        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                temperature: 0.2
            })
        })

        if(!response.ok) {
            const text = await response.text();
            return NextResponse.json({
                error: `DeepSeek API ERROR: ${response.status} - ${text}`
            }, {
                status: 502
            })
        }
        const data = await response.json();
        const completion = data.choices[0].message.content;


        const dataToInsert = {
            user_id: user.id,
            equation: equation,
            result: completion,
        }

        const { data: data2 } = await supabase.from('queries').insert(dataToInsert).select('id').single();
        const id = data2?.id;

        return NextResponse.json({
            result: completion,
            query_id: id
        })
        
    } catch (error) {
        return NextResponse.json({
            error: (error as Error).message || 'An unknown error occurred.'
        }, {
            status: 500
        })
    }
}