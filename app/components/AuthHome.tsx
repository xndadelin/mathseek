'use client';

import 'mathlive';
import { useEffect, useMemo, useState } from 'react';
import Editor from './Editor';
import { useDisclosure } from '@mantine/hooks';
import { Accordion, Alert, AppShell, Badge, Burger, Button, Card, Container, Divider, Group, Stack, Text, Title, Modal, TextInput, Textarea} from '@mantine/core';
import { InlineMath, BlockMath } from 'react-katex';
import Navbar from './Navbar';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '../utils/supabase/client';
import { IconTopologyFull } from '@tabler/icons-react';

function cleanLatex(s?: string): string {
  if (!s) return '';
  if (typeof s !== 'string') return '';
  return s.trim();
}

type StepItem = {
    step: string;
    expression: string;
    justification: string;
}

type CheckItem = {
    candidate: string;
    residual_or_truth: string;
    valid: boolean;
}

type Verification = {
    method?: string;
    checks?: CheckItem[];
    extraneous_solutions?: string[]
}

type Formats = {
    exact?: string;
    approx_decimal?: {
            value: string;
            precision: number | string;
        };
    interval_notation?: string;
}

type typeSolveJSON = {
    problem_latex?: string;
    problem_text?: string;
    assumptions?: string;
    steps?: StepItem[]
    solution_set?: string[];
    final_answer?: string;
    verification?: Verification;
    formats?: Formats;
    notes?: string;
    error?: string;
    query_id?: string;
}

function stripCodeFence(s: string): string {
  const trimmed = s.trim();
  const match = trimmed.match(/^```(?:\w+)?\n([\s\S]*?)\n```$/);
  return match ? match[1] : trimmed;
}

function safeParse<T>(s: string): T | null {
  try {
    return JSON.parse(s) as T;
  } catch {
    try {
      return JSON.parse(stripCodeFence(s)) as T;
    } catch {
      return null;
    }
  }
}


function normalizeResult(input: string | typeSolveJSON | null) : typeSolveJSON | null {
    if(!input) return null;
    if(typeof input === 'string') {
        const once = safeParse<typeSolveJSON>(input);
        if(typeof once === 'string') {
            const twice = safeParse<typeSolveJSON>(once);
            return twice ?? null;
        }
        if(once && typeof once === 'object') return once as typeSolveJSON;
        return null;
    }
    return input;
} 

function getErrorMessage(e: unknown): string {
    if(e instanceof Error) return e.message;
    if(typeof e === 'string') return e;
    return 'Unexpected error occurred.'
}

function stripDelimiters(s?: string) : string | null {
    if(!s) return null;
    const t = s.trim();
    if((t.startsWith('$$') && t.endsWith('$$')) ||
       (t.startsWith('\\[') && t.endsWith('\\]'))) {
        return t.slice(2, -2).trim() || null;
    }
    if((t.startsWith('$') && t.endsWith('$')) ||
       (t.startsWith('\\(') && t.endsWith('\\)'))) {
        return t.slice(1, -1).trim() || null;
    }
    return t === '' ? null : t;
}

export function LatexInline({ tex }: { tex?: string }) {
  if (!tex) return null;
  return <InlineMath math={stripDelimiters(cleanLatex(tex)) || ''} />;
}

function LatexBlock({ tex }: { tex?: string }) {
  if (!tex) return null;
  return <BlockMath math={stripDelimiters(cleanLatex(tex)) || ''} />;
}



function renderTextWithLatex(input: string): React.ReactNode {
  if (!input) return null;
  const s = cleanLatex(input);

  const SPLIT = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[\s\S]*?\$|\\\([\s\S]*?\\\))/g;
  const IS_MATH = /^(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[\s\S]*?\$|\\\([\s\S]*?\\\))$/;
  const LOOKS_TEX = /\\(frac|cdot|sqrt|left|right|sum|int|alpha|beta|gamma)|[\^_]/;

  const parts = s.split(SPLIT).filter(Boolean);

  if (parts.length === 1 && !IS_MATH.test(s) && LOOKS_TEX.test(s)) {
    return <InlineMath math={stripDelimiters(s) || s} />;
  }

  return parts.map((part, i) =>
    IS_MATH.test(part)
      ? <InlineMath key={i} math={stripDelimiters(part) || ''} />
      : <span key={i}>{part}</span>
  );
}



export default function AuthHome() {
    const [value, setValue] = useState('');
    const [opened, { toggle }] = useDisclosure();
    const [solveRaw, setSolveRaw] = useState<string | typeSolveJSON | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const [currentQueryId, setCurrentQueryId] = useState<string | null>(null);
    const [openedLuigi, { toggle: toggleLuigi, open: openLuigi, close: closeLuigi }] = useDisclosure(false);
    const [selectedStep, setSelectedStep] = useState<StepItem | null>(null);
    const [luigiQuestion, setLuigiQuestion] = useState<string>('');
    const [luigiAnswer, setLuigiAnswer] = useState<string | null>(null);
    const [luigiLoading, setLuigiLoading] = useState<boolean>(false);

    useEffect(() => {
        if(luigiAnswer !== null) {
            closeLuigi();
        }
    }, [luigiAnswer])

    useEffect(() => {
        const fetch = async () => {
            const normalized = normalizeResult(solveRaw);
            const supabase = createClient();
            if (currentQueryId && normalized?.query_id !== currentQueryId) { 
                const { data } = await supabase.from('queries').select('*').eq('id', currentQueryId).single();
                if(data) {
                    setSolveRaw(data.result);
                }
            }
        }
        fetch();
    }, [currentQueryId])

    const handleSolve = async() => {
        try {
            setSolveRaw(null)
            setLoading(true);
            setError(null);
            const response = await fetch('/api/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    equation: cleanLatex(value)
                })
            })
            const data = (await response.json()) as { result?: unknown; query_id?: string }
            const r = typeof data?.result === 'string' || (data?.result && typeof data.result === 'object') ? (data.result as string | typeSolveJSON) : null;
            setCurrentQueryId(data?.query_id || null)
            setSolveRaw(r);
            queryClient.invalidateQueries({ queryKey: ['queries']})
        } catch (error: unknown) {
            setError(getErrorMessage(error))
        } finally {
            setLoading(false);
        }
    }

    const handleLuigi = async() => {
        if(!selectedStep) return;
        try {
            setLuigiLoading(true);
            setLuigiAnswer(null);
            const luigiInput = `
                I have the following math problem and one of its solution steps.
                Problem: ${parsed?.problem_text}
                Step: ${selectedStep.step}
                Expression: ${selectedStep.expression}
                Justification: ${selectedStep.justification}

                Please answer the following question about this step:
                ${luigiQuestion}

                Please provide a detailed explanation or answer to the question asked above.
                Please respond with only a latex-formatted text answer.
                Such as: $$ your latex answer here $$.
                No additional commentary/text outside of latex.
                Please enclose the answer in delimiters like $$...$$ or \[...\].
                I do not accept answers that are not delimited from the start. The first character must be $ or \.
            `
            const response = await fetch('/api/luigi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    luigiInput
                })
            })
            const data = await response.json();
            const r = typeof data?.result === 'string' ? data.result : null;
            setLuigiAnswer(r);
            setLuigiLoading(false)
        } catch (error: unknown) {
            setLuigiAnswer(getErrorMessage(error))
        }
    }

    console.log(luigiAnswer)

    const parsed: typeSolveJSON | null = useMemo(() => normalizeResult(solveRaw), [solveRaw]);
    const hasVerification =
    !!(parsed?.verification?.method ||
        (parsed?.verification?.checks?.length ?? 0) > 0 ||
        (parsed?.verification?.extraneous_solutions?.length ?? 0) > 0);

    return (
        <AppShell
            navbar={{ width: 300, breakpoint: 'sm', collapsed: {
                mobile: !opened
            }}}
            padding={"md"}
            header={{
                height: {
                    base: 60, 
                    sm: 0
                }
            }}
        >
            <AppShell.Header hiddenFrom='sm'>
                <Group h="100%" px="md">
                    <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom='sm' />
                    mathseek
                </Group>
            </AppShell.Header>
            <Navbar setCurrentQueryId={setCurrentQueryId} setSolveRaw={setSolveRaw} currentQueryId={currentQueryId} />
            <AppShell.Main mt="lg" >
                <Container>
                    <Group justify='space-between'>
                        <Title order={3} ml="lg">
                            Write your equation below:
                        </Title>
                        <Button onClick={handleSolve} loading={loading} variant='light' color='cyan' size="sm" mr="lg">
                            Solve!
                        </Button>
                    </Group>
                    <Editor value={value} setValue={setValue} />
                    {error && (
                        <Alert color="red" title="Error" mb="md">
                            {error}
                        </Alert>
                    )}

                    {parsed && !parsed.error && (
                        <Stack gap="md">
                            <Card withBorder>
                                <Group justify='space-between' mb="xs">
                                    <Title order={4}>Problem</Title>
                                    <Badge c="cyan" variant='light'>Solution</Badge>
                                </Group>
                                <Text style={{
                                    whiteSpace: 'pre-wrap',
                                    textAlign: 'center'
                                }}>
                                    {renderTextWithLatex(parsed.problem_text || parsed.problem_latex || 'No problem provided.')}
                                </Text>
                                {parsed.assumptions && (
                                    <>
                                        <Text c="dimmed" size="sm">
                                            Assumptions
                                        </Text>
                                        <Text size="sm" style={{
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {renderTextWithLatex(parsed.assumptions)}
                                        </Text>
                                    </>
                                )}
                            </Card>

                                {parsed.steps && parsed.steps.length > 0 && (
                                    <Card withBorder>
                                        <Title order={4} mb="sm">
                                            Steps
                                        </Title>
                                        <Accordion variant='separated' multiple>
                                            {parsed.steps.map((stepItem, index) => (
                                                <Accordion.Item
                                                    key={`step-${index}`}
                                                    value={`step-${index}`}
                                                >
                                                    <Accordion.Control>
                                                        <Group gap="xs">
                                                            <Text fw={600}>
                                                                Step {index + 1}
                                                            </Text>
                                                            <Text c="dimmed" size="sm" style={{
                                                                whiteSpace: 'pre-wrap',
                                                            }}>
                                                                {renderTextWithLatex((stepItem.step))}
                                                            </Text>
                                                        </Group>
                                                    </Accordion.Control>
                                                    <Accordion.Panel >
                                                        <Text style={{
                                                            textAlign: 'center'
                                                        }}
                                                            size='lg'
                                                        >
                                                            {renderTextWithLatex(stepItem.expression)}
                                                        </Text>
                                                        {stepItem.justification && (
                                                            <>
                                                                <Group justify='space-between'>
                                                                    <Stack gap={0}>
                                                                        <Text c="dimmed" size="sm" mt="sm">
                                                                            Justification
                                                                        </Text>
                                                                        <Text size="sm">
                                                                            {renderTextWithLatex(stepItem.justification)}
                                                                        </Text>
                                                                    </Stack>
                                                                    <Button onClick={() => {
                                                                        setSelectedStep(stepItem);
                                                                        openLuigi();
                                                                    }} mt="md" color='cyan' variant='light'>
                                                                        <IconTopologyFull />
                                                                    </Button>
                                                                </Group>
                                                            </>
                                                        )}
                                                    </Accordion.Panel>
                                                </Accordion.Item>
                                            ))}
                                        </Accordion>
                                    </Card>
                                )}
                                {(parsed.final_answer || (parsed.solution_set && parsed.solution_set.length > 0)) && (
                                    <Card withBorder>
                                        <Title order={3} mb="sm">
                                            Final answer
                                        </Title>
                                        <Text>
                                            {renderTextWithLatex(
                                                parsed.final_answer || 'No final answer provided.'
                                            )}
                                        </Text>
                                        {parsed.solution_set && parsed.solution_set.length > 0 && (
                                            <>
                                                <Text c="dimmed" size="sm" mt="sm">
                                                    Solution set
                                                </Text>
                                                <Stack gap={4}>
                                                    {parsed.solution_set.map((sol, index) => (
                                                        <Text key={`solution-${index}`} size="sm">
                                                            {renderTextWithLatex(sol)}
                                                        </Text>
                                                     ))}
                                                </Stack>
                                            </>
                                        )}
                                    </Card>
                                )}

                                {parsed.formats && (
                                    <Card withBorder>
                                        <Title order={5} mb="xs">
                                            Formats
                                        </Title>
                                        {parsed.formats.exact && (
                                            <>
                                                <Text fw={600}>Exact</Text>
                                                <Text size="sm" style={{
                                                        whiteSpace: 'pre-wrap'
                                                    }}>
                                                        {renderTextWithLatex(parsed.formats.exact)}
                                                    </Text>
                                            </>
                                        )}
                                        {parsed.formats.approx_decimal?.value && (
                                            <>
                                                <Text fw={600} mt="sm">
                                                    Approx.
                                                </Text>
                                                 <Text size="sm" style={{
                                                        whiteSpace: 'pre-wrap'
                                                    }}>
                                                        {renderTextWithLatex(parsed.formats.approx_decimal.value)}
                                                    </Text>
                                                <Text size="xs" c="dimmed">
                                                    (Precision: {renderTextWithLatex(parsed.formats.approx_decimal.precision as string)} decimal places)
                                                </Text>
                                            </>
                                        )}
                                        {parsed.formats.interval_notation && parsed.formats.interval_notation.trim() !== '' && (
                                            <>
                                                <Text fw={600} mt="sm">
                                                    Interval notation
                                                </Text>
                                                <Text size="sm" style={{
                                                        whiteSpace: 'pre-wrap'
                                                    }}>
                                                        {renderTextWithLatex(parsed.formats.interval_notation)}
                                                </Text>
                                            </>
                                        )}
                                    </Card>
                                )}

                                {hasVerification && (
                                        <Card withBorder>
                                            <Title order={5} mb="xs">
                                                Verification
                                            </Title>
                                            {parsed.verification?.method && (
                                                <>
                                                    <Text c="dimmed" size="sm">
                                                        Method
                                                    </Text>
                                                    <Text size="sm" style={{
                                                        whiteSpace: 'pre-wrap'
                                                    }}>
                                                        {renderTextWithLatex(parsed.verification.method)}
                                                    </Text>
                                                </>
                                            )}
                                            {parsed.verification?.checks && parsed.verification.checks.length > 0 && (
                                                <>
                                                    <Divider my="sm" /> 
                                                    <Text fw={600}>Checks</Text>

                                                    <Stack gap="sm" mt="xs">
                                                        {parsed.verification.checks.map((check, index) => (
                                                            <Card key={`check-${index}`} padding="sm" withBorder>
                                                                <Text size="sm">Candidate: </Text>
                                                                <Text size="sm" style={{
                                                                    whiteSpace: 'pre-wrap'
                                                                }}>
                                                                        {renderTextWithLatex(check.candidate)}
                                                                </Text>
                                                                <Text size="sm" mt={6}>Residual/Truth:</Text> 
                                                                <Text size="sm" style={{
                                                                    whiteSpace: 'pre-wrap'
                                                                }}>
                                                                        {renderTextWithLatex(check.residual_or_truth)}
                                                                </Text>
                                                                <Badge bg="dark" mt="sm" c={check.valid ? 'teal' : 'red'}>
                                                                    {check.valid ? 'Valid' : 'Invalid' }
                                                                </Badge>
                                                            </Card>
                                                        ))}
                                                    </Stack>
                                                </>
                                            )}
                                            {parsed.verification?.extraneous_solutions && parsed.verification.extraneous_solutions.length > 0 && (
                                                <>
                                                    <Divider my="sm" />
                                                    <Text fw={600}>Extraneous solutions</Text>
                                                    <Stack gap={4} mt="xs">
                                                        {parsed.verification.extraneous_solutions.map((sol, index) => (
                                                            <Text key={`extraneous-${index}`} size="sm">
                                                                {renderTextWithLatex(sol)}
                                                            </Text>
                                                        ))}
                                                    </Stack>
                                                </>
                                            )}
                                        </Card>
                                    )}
                                    {parsed.notes && (
                                        <Card withBorder>
                                            <Title order={5} mb="xs">
                                                Notes
                                            </Title>
                                            <Text size="sm">{renderTextWithLatex(parsed.notes)}</Text>
                                        </Card>
                                    )}
                        </Stack>
                    )}

                </Container>
                <Modal
                    opened={openedLuigi}
                    onClose={closeLuigi}
                    centered
                    size="lg"
                    title="🚩 Ask Luigi something about this step:"
                    closeOnClickOutside={!luigiLoading}
                >
                        <Textarea
                            placeholder='E.g., "I do not understand how you muliplied both sides by x+2. Explain."'
                            label="Your question for Luigi:"
                            minRows={4}
                            autosize
                            mb="md"
                            value={luigiQuestion || ''}
                            onChange={(e) => setLuigiQuestion(e.currentTarget.value)}
                        >

                        </Textarea>
                        <Text size="sm" c="dimmed">
                            * You do not need to include the step itself or the problem statement, Luigi will have access to that information. 
                        </Text>
                        <Button loading={luigiLoading} onClick={handleLuigi} mt="md" fullWidth color="cyan" variant='light'>
                            Ask Luigi
                        </Button>
                </Modal>
                <Modal
                    opened={luigiAnswer !== null}
                    onClose={() => setLuigiAnswer(null)}
                    centered
                    fullScreen
                >
                    <div style={{
                        justifyContent: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%'
                    }}>
                        <Text style={{
                            whiteSpace: 'pre-wrap',
                            maxWidth: '1000px',
                            textAlign: 'center',
                        }}>
                            {renderTextWithLatex(luigiAnswer || '')}
                        </Text>
                    </div>
                </Modal>
            </AppShell.Main>
        </AppShell>

    )
}