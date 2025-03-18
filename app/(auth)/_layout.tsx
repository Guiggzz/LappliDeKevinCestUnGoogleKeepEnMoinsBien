import { Stack } from "expo-router";

export default function Auth() {
    return (
        <Stack screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
        }}>
            <Stack.Screen name="Login" />
        </Stack>
    );
}
