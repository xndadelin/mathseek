import { AppShell, Group, NavLink, ScrollArea, Text, ThemeIcon} from "@mantine/core";
import { IconMath } from "@tabler/icons-react";;
import useQueries from "../utils/queries/useQueries";
import Loading from "./Loading";
import { LatexInline } from "./AuthHome";
import type { Dispatch, SetStateAction } from "react";

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


type Query = {
    id?: string | null;
    equation?: string | null;
    created_at?: string | null;
}

interface NavbarProps {
  setCurrentQueryId: Dispatch<SetStateAction<string | null>>;
  currentQueryId: string | null;
  setSolveRaw: Dispatch<SetStateAction<string | null>>;
}


export default function Navbar({ setCurrentQueryId, currentQueryId, setSolveRaw }: NavbarProps)  {
  const { data, isError, isLoading } = useQueries();
  if(isLoading) return <Loading />

  return (
    <AppShell.Navbar bg={"var(--mantine-color-dark-8)"}>
      <AppShell.Section p="md">
        <Group justify="space-between">
            <ThemeIcon
                variant="light"
            >
                <IconMath />
            </ThemeIcon>
            <Text fw={700}>MathSeek</Text>
        </Group>
      </AppShell.Section>
      <AppShell.Section my="md" grow component={ScrollArea}>
         <NavLink label="Recent queries" px={10} />
         {data?.map((query:Query) => (
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
         ))}
      </AppShell.Section> 
      <AppShell.Section p="md">User related stuff</AppShell.Section>
    </AppShell.Navbar>
  );
}
