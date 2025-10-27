'use client';

import 'mathlive';
import { useMemo, useState } from 'react';
import Editor from './Editor';
import { useDisclosure } from '@mantine/hooks';
import { AppShell, Burger, Button, Container, Group, NavLink, ScrollArea, Title } from '@mantine/core';
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
    ßinterval_notation?: string;
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

function LatexInline({ tex }: { tex?: string }) {
    if(!tex) return null;
    return <InlineMath math={tex} />
}

function LatexBlock({ tex }: { tex?: string }) {
    if(!tex) return null;
    return <BlockMath math={tex} />
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
            header={{ height: 60 }}
            navbar={{ width: 300, breakpoint: 'sm', collapsed: {
                mobile: !opened
            }}}
            padding={"md"}
        >
            <AppShell.Header bg={"var(--mantine-color-dark-8)"} > 
                <Group h="100%" px="md">
                    <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom='sm' />
                    mathseek
                </Group>
            </AppShell.Header>
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
                        <Button onClick={handleSolve} variant='light' color='cyan' size="sm" mr="lg">
                            Solve!
                        </Button>
                    </Group>
                    <Editor value={value} setValue={setValue} />
                </Container>
            </AppShell.Main>
        </AppShell>

    )
}