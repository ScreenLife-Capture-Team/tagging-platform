"use client";
import { Flex, Heading, Separator, Text } from "@radix-ui/themes";
import Sidebar from "../../components/Sidebar/Index";
import { useAuth } from "../../store/useAuth";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  return (
    <Flex direction="column" style={{ flex: 1, height: "100vh" }}>
      <Flex p="2" justify="between" align="center">
        <Heading size="3">ScreenLife Tagging Platform</Heading>
        <Text size="1" color="gray" mx="1">
          {user?.email} ({user?.type})
        </Text>
      </Flex>
      <Separator size="4" />
      <Flex direction="row" style={{ height: "100%" }}>
        <Flex p="2" gap="2">
          <Sidebar />
        </Flex>
        <Separator size="4" orientation="vertical" />
        <Flex
          style={{ flex: 1, height: "100%", backgroundColor: "#fafafa" }}
          p="4"
        >
          {children}
        </Flex>
      </Flex>
    </Flex>
  );
}
