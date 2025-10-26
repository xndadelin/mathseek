import { Loader, Center } from "@mantine/core";

export default function Loading() {{
    return (
        <Center style={{ height: '100vh'}}>
            <Loader size="xl" type="dots" />
        </Center>
    )
}}