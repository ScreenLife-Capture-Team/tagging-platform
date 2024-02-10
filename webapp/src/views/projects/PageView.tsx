"use client";
import {
  Callout,
  Container,
  Flex,
  Heading,
  Link,
  Table,
  Text,
} from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { app } from "../../client";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { useSearchParams } from "next/navigation";
import { User } from "screenlife-platform-server";

function Collab(props: { email: string; id: number }) {
  return (
    <Flex>
      <Text>{props.email}</Text>
    </Flex>
  );
}

export default function PageView() {
  useAuthGuard();
  const projectId = useSearchParams().get("id") as string;
  const { data } = useQuery({
    queryKey: ["projects", projectId],
    queryFn: () => app.service("projects").get(projectId),
  });

  return (
    <Container>
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between">
          <Heading>Project {data?.id}</Heading>
        </Flex>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Participants</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>
                Collaborator Contributions
              </Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data?.participants.map((p) => (
              <Table.Row key={p.id}>
                <Table.Cell style={{ width: 180 }}>{p.id}</Table.Cell>
                <Table.Cell>
                  {data.collaborators.map((c) => (
                    <Collab id={c.id} email={c.email} />
                  ))}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Flex>
    </Container>
  );
}
