'use client';

import 'mathlive';
import { useMemo, useState } from 'react';
import Editor from './Editor';
import { useDisclosure } from '@mantine/hooks';
import { Alert, AppShell, Badge, Burger, Button, Card, Container, Divider, Group, NavLink, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { InlineMath, BlockMath } from 'react-katex';

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
            precision: number;
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
}

function safeParse<T>(s: string): T | null {
    try {
        return JSON.parse(s) as T;
    } catch {
        return null;
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
    let t = s.trim();
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

function LatexInline({ tex }: { tex?: string }) {
    if(!tex) return null;
    return <InlineMath math={stripDelimiters(tex) || ''} />
}

function LatexBlock({ tex }: { tex?: string }) {
    if(!tex) return null;
    return <BlockMath math={stripDelimiters(tex) || ''} />
} 

function renderTextWithLatex(input: string): React.ReactNode {
  const parts = input.split(/(\\\(.+?\\\)|\$.+?\$)/g);
  if(parts.length === 0) return null;
  return parts.map((part, i) => {
    if (part.match(/(\\\(.+?\\\)|\$.+?\$)/)) {
      const tex = part.replace(/^\$|\\\(|\)$|\\\)$/g, '');
      return <InlineMath key={i} math={tex} />;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function AuthHome() {
    const [value, setValue] = useState('');
    const [opened, { toggle }] = useDisclosure();
    const [solveRaw, setSolveRaw] = useState<string | typeSolveJSON | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSolve = async() => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    equation: value
                })
            })
            const data = (await response.json()) as { result?: unknown }
            const r = typeof data?.result === 'string' || (data?.result && typeof data.result === 'object') ? (data.result as string | typeSolveJSON) : null;
            setSolveRaw(r);
        } catch (error: unknown) {
            setError(getErrorMessage(error))
        } finally {
            setLoading(false);
        }
    }

    const parsed: typeSolveJSON | null = useMemo(() => normalizeResult(solveRaw), [solveRaw])

    return (
        <AppShell
            navbar={{ width: 300, breakpoint: 'sm', collapsed: {
                mobile: !opened
            }}}
            padding={"md"}
        >
            <AppShell.Navbar bg={"var(--mantine-color-dark-8)"}>
                <AppShell.Section p="md">
                    Past problems
                </AppShell.Section>
                <AppShell.Section my="md" grow component={ScrollArea} px="md">
                    {Array(100).fill(0).map((_, index) => (
                        <NavLink
                            href="#"
                            key={index}
                            onClick={(e) => e.preventDefault()}
                            label={`problem ${index + 1}`}
                        />
                    ))}
                </AppShell.Section>
                <AppShell.Section p="md">
                    User related stuff
                </AppShell.Section>
            </AppShell.Navbar>
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
                    <Divider my="lg" />

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
                                    <Badge variant='light'>Solution</Badge>
                                </Group>
                                <LatexBlock tex={parsed.problem_latex ?? parsed.problem_text} />
                                {parsed.assumptions && (
                                    <>
                                        <Text c="dimmed" size="sm">
                                            Assumptions
                                        </Text>
                                        <LatexInline tex={parsed.assumptions} />
                                    </>
                                )}
                            </Card>

                                {parsed.steps && parsed.steps.length > 0 && (
                                    <Card withBorder>
                                        <Title order={4} mb="sm">
                                            Steps
                                        </Title>
                                        <Stack gap="sm">
                                            {parsed.steps.map((step, index) => (
                                                <Card key={`step-${index}`} withBorder padding={"sm"} radius={"md"}>
                                                    <Text fw={600}>
                                                        Step {index + 1}:
                                                        <span style={{ fontWeight: 500 }}>
                                                            {renderTextWithLatex(step.step)}
                                                        </span>
                                                    </Text>
                                                    <LatexBlock tex={step.expression} />
                                                    {step.justification && (
                                                        <>
                                                            <Text c="dimmed" size="sm">
                                                                Justification
                                                            </Text>
                                                            <Text size="sm">
                                                                {renderTextWithLatex(step.justification)}
                                                            </Text>
                                                        </>
                                                    )}
                                                </Card>
                                            ))}
                                        </Stack>
                                    </Card>
                                )}
                                {(parsed.final_answer || (parsed.solution_set && parsed.solution_set.length > 0)) && (
                                    <Card withBorder>
                                        <Title order={3} mb="sm">
                                            Final answer
                                        </Title>
                                        <LatexBlock tex={parsed.final_answer} />
                                        {parsed.solution_set && parsed.solution_set.length > 0 && (
                                            <>
                                                <Text c="dimmed" size="sm" mt="sm">
                                                    Solution set
                                                </Text>
                                                <Stack gap={4}>
                                                    {parsed.solution_set.map((sol, index) => (
                                                        <LatexInline key={`solution-${index}`} tex={sol} />
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
                                                <LatexInline tex={parsed.formats.exact} />
                                            </>
                                        )}
                                        {parsed.formats.approx_decimal?.value && (
                                            <>
                                                <Text fw={600} mt="sm">
                                                    Approx.
                                                </Text>
                                                <LatexInline tex={parsed.formats.approx_decimal.value} />
                                                <Text size="xs" c="dimmed">
                                                    (Precision: {parsed.formats.approx_decimal.precision} decimal places)
                                                </Text>
                                            </>
                                        )}
                                        {parsed.formats.interval_notation && parsed.formats.interval_notation.trim() !== '' && (
                                            <>
                                                <Text fw={600} mt="sm">
                                                    Interval notation
                                                </Text>
                                                <LatexInline tex={parsed.formats.interval_notation} />
                                            </>
                                        )}
                                    </Card>
                                )}

                                {(parsed.verification?.method) ||
                                    (parsed.verification?.checks && parsed.verification.checks.length > 0) ||
                                    (parsed.verification?.extraneous_solutions && parsed.verification.extraneous_solutions.length > 0) && (
                                        <Card withBorder>
                                            <Title order={5} mb="xs">
                                                Verification
                                            </Title>
                                            {parsed.verification?.method && (
                                                <>
                                                    <Text c="dimmed" size="sm">
                                                        Method
                                                    </Text>
                                                    <LatexInline tex={parsed.verification.method} />
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
                                                                <LatexInline tex={check.candidate} />
                                                                <Text size="sm" mt={6}>Residual/Truth:</Text> 
                                                                <LatexInline tex={check.residual_or_truth} />
                                                                <Badge mt="sm" c={check.valid ? 'teal' : 'red'}>
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
                                                            <LatexInline key={`extraneous-${index}`} tex={sol} />
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
            </AppShell.Main>
        </AppShell>

    )
}