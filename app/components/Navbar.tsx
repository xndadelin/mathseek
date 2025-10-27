import { AppShell, Avatar, Group, NavLink, ScrollArea, Text, ThemeIcon, UnstyledButton} from "@mantine/core";
import { IconLogout, IconMath } from "@tabler/icons-react";;
import useQueries from "../utils/queries/useQueries";
import Loading from "./Loading";
import { LatexInline } from "./AuthHome";
import type { Dispatch, SetStateAction } from "react";
import useUser from "../utils/queries/useUser";
import { createClient } from "../utils/supabase/client";

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

type Query = {
    id?: string | null;
    equation?: string | null;
    created_at?: string | null;
}

interface NavbarProps {
  setCurrentQueryId: Dispatch<SetStateAction<string | null>>;
  currentQueryId: string | null;
  setSolveRaw: Dispatch<SetStateAction<string | typeSolveJSON |  null>>;
}


export default function Navbar({ setCurrentQueryId, currentQueryId, setSolveRaw }: NavbarProps)  {
  const { data, isError, isLoading } = useQueries();
  const { data: user, isLoading: isUserLoading } = useUser();
  if(isLoading || isUserLoading) return <Loading />

  return (
    <AppShell.Navbar bg={"var(--mantine-color-dark-8)"}>
      <AppShell.Section p="md">
        <Group justify="space-between">
            <ThemeIcon
                variant="light"
                color="cyan"
            >
                <IconMath />
            </ThemeIcon>
            <Text fw={700}>MathSeek</Text>
        </Group>
      </AppShell.Section>
      <AppShell.Section my="md" grow component={ScrollArea}>
         <NavLink label="Recent queries" px={10} />
         {data.length > 0 ? data.map((query:Query) => (
             <NavLink
                key={query.id}
                label={<LatexInline tex={sanitizeMathInput(query.equation as string) || ''} />}
                style={{
                  lineClamp: 1
                }}
                onClick={() => {
                  setCurrentQueryId(query.id || '');
                  setSolveRaw(null);
                }}
                bg={currentQueryId === query.id ? 'var(--mantine-color-dark-6)' : undefined}
             />
         )): (
            <Text px={10} c="dimmed">No recent queries.</Text>
         )}
      </AppShell.Section> 
      <AppShell.Section p="md">
         <UnstyledButton w={"100%"}>
            <Group>
              <Avatar radius={"xl"} src={user?.user_metadata?.avatar_url} />

              <div style={{ flex: 1 }}>
                <Text size="sm" fw={500}>
                  {user?.user_metadata?.full_name}
                </Text>

                <Text c="dimmed" size="xs">
                  {user?.user_metadata?.email}
                </Text>
              </div>

              <ThemeIcon
                variant="transparent"
                color="dark"
                onClick={async() => {
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  window.location.href = '/'
                }}
              >
                <IconLogout size={20} />
              </ThemeIcon>

            </Group>
         </UnstyledButton>
      </AppShell.Section>
    </AppShell.Navbar>
  );
}
