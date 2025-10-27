import { AppShell, Group, NavLink, ScrollArea, Text, ThemeIcon} from "@mantine/core";
import { IconLayoutSidebarRight, IconMath } from "@tabler/icons-react";
import { useState } from "react";

export default function Navbar() {
  const [hidden, setHidden] = useState(false);

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
      <AppShell.Section my="md" grow component={ScrollArea} px="md">
        {Array(100)
          .fill(0)
          .map((_, index) => (
            <NavLink
              href="#"
              key={index}
              onClick={(e) => e.preventDefault()}
              label={`problem ${index + 1}`}
            />
          ))}
      </AppShell.Section>
      <AppShell.Section p="md">User related stuff</AppShell.Section>
    </AppShell.Navbar>
  );
}
