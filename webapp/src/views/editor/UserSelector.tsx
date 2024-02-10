import { Badge, Button, Flex, Popover, Text } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { User } from "screenlife-platform-server";
import { app } from "../../client";
import { useSearchParams } from "next/navigation";
import { useAuth } from "../../store/useAuth";

export function UserSelector(props: {
  asUser: number | undefined;
  onChangeUser: (id: number | undefined) => void;
}) {
  const projectId = useSearchParams().get("pj") as string | undefined;
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: [],
    queryFn: () => app.service("projects").get(projectId!),
  });

  const userToShow = props.asUser
    ? data?.collaborators.find((c) => c.id === props.asUser)
    : user;

  return (
    <Popover.Root>
      <Popover.Trigger>
        <Badge
          color={props.asUser ? "yellow" : "gray"}
          style={{ cursor: user?.type === "admin" ? "pointer" : undefined }}
        >
          {props.asUser ? "Previewing as: " : ""}
          {userToShow?.email}
        </Badge>
      </Popover.Trigger>
      <Popover.Content>
        <Flex direction="column" gap="2">
          <Text size="2" color="gray">
            Preview as:
          </Text>
          <Flex direction="column" gap="1">
            {data?.collaborators.map((c) => (
              <Flex
                style={{ cursor: "pointer" }}
                onClick={() => props.onChangeUser(c.id)}
              >
                <Text size="2" key={c.id}>
                  {c.email}
                </Text>
              </Flex>
            ))}
          </Flex>
          <Button
            size="1"
            variant="soft"
            onClick={() => props.onChangeUser(undefined)}
            mt="1"
          >
            Reset
          </Button>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}
