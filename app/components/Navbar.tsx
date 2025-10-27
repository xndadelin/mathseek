import { AppShell, Group, NavLink, ScrollArea, Text, ThemeIcon} from "@mantine/core";
import { IconMath } from "@tabler/icons-react";;
import useQueries from "../utils/queries/useQueries";
import Loading from "./Loading";
import { LatexInline } from "./AuthHome";

type Query = {
    id?: string | null;
    equation?: string | null;
    created_at?: string | null;
}

export default function Navbar() {
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
                label={<LatexInline tex={query.equation || ''} />}
             />
         ))}
      </AppShell.Section> 
      <AppShell.Section p="md">User related stuff</AppShell.Section>
    </AppShell.Navbar>
  );
}
