'use client';

import 'mathlive';
import { useState } from 'react';
import Editor from './Editor';
import { useDisclosure } from '@mantine/hooks';
import { AppShell, Burger, Button, Container, Group, NavLink, ScrollArea, Text, Title } from '@mantine/core';


export default function AuthHome() {
    const [value, setValue] = useState('');
    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 300, breakpoint: 'sm', collapsed: {
                mobile: !opened
            }}}
            padding={"md"}
        >
            <AppShell.Header>
                <Group h="100%" px="md">
                    <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom='sm' />
                    mathseek
                </Group>
            </AppShell.Header>
            <AppShell.Navbar>
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
                        <Button variant='light' color='cyan' size="sm" mr="lg">
                            Solve!
                        </Button>
                    </Group>
                    <Editor value={value} setValue={setValue} />
                </Container>
            </AppShell.Main>
        </AppShell>

    )
}