'use client';
import { Anchor, AppShell, Badge, Box, Button, Card, Container, Divider, Group, Paper, SimpleGrid, Stack, Text, TextInput, ThemeIcon, Title } from "@mantine/core";
import { Icon123, IconArrowDownCircle, IconArrowDownRhombusFilled, IconBrain, IconFreeRights, IconMath, IconQuestionMark, IconSettings } from "@tabler/icons-react";

export default function Home() {
  return (
    <AppShell
      padding={"md"}
      header={{ height: 60 }}
    >
      <AppShell.Header style={{
        backgroundColor: 'transparent',
        borderBottom: '0px',
        position: 'absolute',
      }}>
        <Box>
          <Container size="lg" py="md">
            <Group justify="space-between">
              <Group gap="xs">
                <ThemeIcon size={"lg"} variant="light" color="cyan">
                  <IconMath size={20} />
                </ThemeIcon>
                <Title order={3} fw={700}>MathSeek</Title>
              </Group>
              <Group align="center" justify="center">
                <Anchor href="#about" style={{
                  textDecoration: 'none',
                  color: 'var(--mantine-color-light-0)'
                }}>
                  About
                </Anchor>
                <Anchor href="#features" style={{
                  textDecoration: 'none',
                  color: 'var(--mantine-color-light-0)'
                }}>
                  Features
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
                      <Title order={1} fz="46" fw={800} maw={800}  style={{ textAlign: 'center', lineHeight: 1.2 }}>
                        Solve any math problem{' '}
                        <Text component="span" variant="gradient" c="cyan" fz={46} fw={800}>
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
                  <Container size="lg" mt={100} id="about">
                    <Stack>
                      <Title order={1} style={{ textAlign: 'center' }}>
                       About MathSeek
                      </Title>
                      <Text size="lg" c="dimmed" style={{ textAlign: 'center' }}>
                        MathSeek is an AI-powered math problem solver that provides step-by-step solutions and explanations for a wide range of mathematical concepts. Whether you're struggling with algebra, calculus, or geometry, MathSeek is here to help you understand and get the answers you need.
                      </Text>
                      <SimpleGrid spacing={"xl"} cols={{ base: 1, sm: 3 }} >
                         <Paper p="md" radius="md" withBorder>
                          <ThemeIcon
                            size={48}
                            radius={"md"}
                            color="grape"
                            variant="light"
                            mb="md"
                          >
                            <IconBrain size={32} />
                          </ThemeIcon>
                          <Text fw={600} mb="xs">
                            What is DeepSeek AI?
                          </Text>
                          <Text size="sm" c="dimmed">
                            DeepSeek AI is a Chinese AI startup that develops open-source large language models (LLMs) and offers a conversational AI product similar to ChatGPT. We use their API to power MathSeeks's problem-solving capabilities.
                          </Text>
                        </Paper>
                        <Paper p="md" radius="md" withBorder>
                          <ThemeIcon
                            size={48}
                            radius={"md"}
                            color="blue"
                            variant="light"
                            mb="md"
                          >
                            <IconFreeRights size={32} />
                          </ThemeIcon>
                          <Text fw={600} mb="xs">
                            Is MathSeek free to use?
                          </Text>
                          <Text size="sm" c="dimmed">
                            Oh, yes! MathSeek is completely free to use. It's an open source project. We believe in providing accessible tools to help students learn.
                          </Text>
                        </Paper>
                        <Paper p="md" radius="md" withBorder>
                          <ThemeIcon
                            size={48}
                            radius={"md"}
                            color="teal"
                            variant="light"
                            mb="md"
                          >
                            <IconQuestionMark size={32} />
                          </ThemeIcon>
                          <Text fw={600} mb="xs">
                            Can I trust the solutions provided
                          </Text>
                          <Text size="sm" c="dimmed">
                            Yes, but it's always a good idea to double check the solutions provided by MathSeek, especially for complex problems. While we strive for accuracy, occasional errors may occur.
                          </Text>
                        </Paper>
                      </SimpleGrid>
                    </Stack>
                  </Container>
                  <Divider my="80" w="200" mx="auto" />
                  <Container size="lg" id="features">
                    <Title order={1} style={{ textAlign: 'center' }}>
                      Features
                    </Title>
                    <SimpleGrid spacing={"xl"} cols={{ base: 1, sm: 3 }} mt="xl">
                      <Card p="md" radius={"md"} withBorder>
                        <ThemeIcon
                          size={48}
                          radius='md'
                          color="cyan"
                          variant="light"
                          mb="md"
                        >
                          <IconSettings size={32} />
                        </ThemeIcon>
                        <Text fw={600} mb="xs">
                          User-friendly interface
                        </Text>
                        <Text size="sm" c="dimmed">
                          We try as much as possible to keep the interface clean and simple, so you can focus on solving your math problems without distractions.
                        </Text>
                      </Card>
                      <Card p="md" radius={"md"} withBorder>
                        <ThemeIcon
                          size={48}
                          radius='md'
                          color="teal"
                          variant="light"
                          mb="md"
                        >
                          <Icon123 size={32} />
                        </ThemeIcon>
                        <Text fw={600} mb="xs">
                          Luigi - AI Assistant
                        </Text>
                        <Text size="sm" c="dimmed">
                          If there is any steps you do not understand, you can ask Luigi, our AI assistant, to explain it further or under different contexts.
                        </Text>
                      </Card>
                      <Card p="md" radius={"md"} withBorder variant="">
                        <ThemeIcon
                          size={48}
                          radius='md'
                          color="red"
                          variant="light"
                          mb="md"
                        >
                          <Icon123 size={32} />
                        </ThemeIcon>
                        <Text fw={600} mb="xs">
                          Step-by-step
                        </Text>
                        <Text size="sm" c="dimmed">
                          Detailed steps and explanations for each solution, helping you understand the process behind the answer.
                        </Text>
                      </Card>
                    </SimpleGrid>
                  </Container>
              </Container>
          </Box>
      </AppShell.Main>
    </AppShell>
  );
}
