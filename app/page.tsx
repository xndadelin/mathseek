'use client';
import { Anchor, AppShell, Badge, Box, Button, Container, Group, Paper, Stack, Text, TextInput, ThemeIcon, Title } from "@mantine/core";
import { IconArrowDownCircle, IconArrowDownRhombusFilled, IconMath } from "@tabler/icons-react";

export default function Home() {
  return (
    <AppShell
      padding={"md"}
      header={{ height: 60 }}
    >
      <AppShell.Header>
        <Box>
          <Container size="lg" py="sm">
            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon size={"lg"} variant="light" color="cyan">
                  <IconMath size={20} />
                </ThemeIcon>
                <Title order={3} fw={700}>MathSeek</Title>
              </Group>
              <Group align="center" justify="center">
                <Anchor href="#features" style={{
                  textDecoration: 'none',
                  color: 'var(--mantine-color-light-0)'
                }}>
                  Features
                </Anchor>
                <Anchor href="#features" style={{
                  textDecoration: 'none',
                  color: 'var(--mantine-color-light-0)'
                }}>
                  How it works
                </Anchor>
                <Button variant="light" size="sm" color="cyan">
                  Start
                </Button>
              </Group>
            </Group>
          </Container>
        </Box>
      </AppShell.Header>
      <AppShell.Main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box>
              <Container size="lg" py={180}>
                  <Stack gap="xl" align="center">
                      <Badge size="lg" variant="filled" color="cyan">
                        Powered by DeepSeek AI
                      </Badge>
                      <Title order={1} fw={800} maw={800}  style={{ textAlign: 'center', lineHeight: 1.2}}>
                        Solve any math problem{' '}
                        <Text component="span" variant="gradient" c="cyan" fz={32} fw={800}>
                          with detailed steps and explanations
                        </Text>
                      </Title>

                      <Text size="xl" style={{ textAlign: 'center' }} c="dimmed" maw={600}>
                        Type in your math problem and get solutions with step-by-step explanations. From algebra to calculus, DeepSeek has you covered!
                      </Text>

                      <Group maw={600} w="100%" style={{
                        display: 'flex',
                        justifyContent: 'center',
                      }}>
                        <Button size="lg" color="cyan" fw={600}>
                          Get started
                        </Button>
                        <Button size="lg" bg="teal" variant="default" fw={600}>
                          Learn more
                        </Button>
                      </Group>
                      <IconArrowDownRhombusFilled size={40} style={{ marginTop: 20 }} color="var(--mantine-color-cyan-6)" />
                  </Stack>
                  <Container size="sm" mt={100}>
                    <Title order={1} style={{ textAlign: 'center' }}>
                      About MathSeek
                    </Title>
                  </Container>
              </Container>
          </Box>
      </AppShell.Main>
    </AppShell>
  );
}
