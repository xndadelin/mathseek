import { NextRequest, NextResponse } from "next/server";

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

        const prompt = `
            You are a higly reliable math solving AI. I will provide you with a math problem in latex; you will return a STRICT JSON object only (no markdown, no codeblocks, no commentary).
    
            Input: Latex string.
            Output: JSON exactly matching this schema(double quotes, valid JSON, escape backslashed in latex):

            Provide the final answer in a JSON object with the following structure:
            {
                "problem_text": "echo of the input latex",
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
                        "precision": "number of decimal places"
                    },
                    "interval_notation": "if inequality/domain, interval notation in latex"
                },
                "notes": "optional latex remarks about special cases/branches/considerations"
            }

            Rules:
            - use pure latex for math tokens only (no surrounding $,$$ or \\( \\))
            - prefer exact/simplified symbolic forms; rationalize denominators; factor where natural.
            - state domain restrictions from denominators, logs, even roots, trig domain, etc. and remove any roots violating them.
            - if multiple solutions/branches exist, list them all in "solution_set",
            - for inequalities, provide solution in interval notation under "formats.interval_notation",
            - for indefinite integrals, include +C; for definite integrals, specify limits clearly;
            - if the input is an expression (not an equation), simplify or evaluate as requested by the text; clarify aim in 'assumptions',
            - if the problem is ambiguous, ill-posed, or not math, return:
              { "error" : "brief reason IN LATEX }
            - output must be only the JSON object. DO NOT include any text outside the JSON structure.
            - when generating the final answer or any explanatory text, do not enclose the entire sentence in latex delimiters ($...$) or ($$...$$); Use inline math like $x=1$ only for mathemtical expressions inside normal text. return human-readable text with math embedded inline, not a full latex block
            - only use line breaks (\n) where absolutely required in multi-line math, and even then, prefer inline LaTeX using spaces.
            - when returning json fields like problem_text steps expressions, final_answer or note, do not include escaped newline \n, use single spaces instead of line breaks, do not escape latex backslashes, use one backslash not 2, do not insert custom commands like \differentialdx, use standard latex notation for diffirenetials (\,dx), do not wrap whole sentences in latex delimiters, use inline math only for math parts, return plain text with inline math, all strings must be valid, one line json strings, no markdown code fences or surrounding quotations.
            - use one backslash not two and avoid \, before differentials write du dx dt instead

            Solve the following equation/problem(LATEX): ${equation}.
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

        return NextResponse.json({
            result: completion
        })
        
    } catch (error) {
        return NextResponse.json({
            error: (error as Error).message || 'An unknown error occurred.'
        }, {
            status: 500
        })
    }
}