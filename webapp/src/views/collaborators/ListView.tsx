"use client";
import {
  Button,
  Container,
  Dialog,
  Flex,
  Heading,
  IconButton,
  Table,
  Text,
} from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { app } from "../../client";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import EditCollaborator from "./EditCollaborator";
import { Pencil1Icon } from "@radix-ui/react-icons";

export default function ListView() {
  useAuthGuard();
  const { data } = useQuery({
    queryKey: ["collaborators"],
    queryFn: () =>
      app.service("users").find({ query: { type: "collaborator" } }),
  });

  return (
    <Container>
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between">
          <Heading>Collaborators</Heading>
          <Dialog.Root>
            <Dialog.Trigger>
              <Button variant="outline">Add Collaborator</Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <EditCollaborator />
            </Dialog.Content>
          </Dialog.Root>
        </Flex>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Project Ids</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data?.data?.map((d) => (
              <Table.Row key={d.id}>
                <Table.Cell style={{ width: 180 }}>{d.email}</Table.Cell>
                <Table.Cell style={{ width: 180 }}>
                  <Flex direction="column">
                    {d.projectIds.map((id) => (
                      <Text key={id}>{id}</Text>
                    ))}
                  </Flex>
                </Table.Cell>
                <Table.Cell align="right" px="4">
                  <Dialog.Root>
                    <Dialog.Trigger>
                      <IconButton size="1" variant="ghost">
                        <Pencil1Icon />
                      </IconButton>
                    </Dialog.Trigger>
                    <Dialog.Content>
                      <EditCollaborator initialData={d} />
                    </Dialog.Content>
                  </Dialog.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Flex>
    </Container>
  );
}
