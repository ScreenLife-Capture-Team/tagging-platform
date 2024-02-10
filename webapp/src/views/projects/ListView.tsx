"use client";
import {
  Callout,
  Container,
  Dialog,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
  Link,
  Table,
  Text,
} from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, app } from "../../client";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { useMemo } from "react";
import { useAuth } from "../../store/useAuth";
import { Project } from "screenlife-platform-server";
import { useRouter } from "next/navigation";
import { Pencil1Icon } from "@radix-ui/react-icons";
import EditProject from "./EditProject";

function TagSet(props: { id: number }) {
  const { data } = useQuery({
    queryKey: ["tagset", props.id],
    queryFn: () => app.service("tagsets").get(props.id),
  });
  return <Text>{data?.name}</Text>;
}

export default function ListView() {
  useAuthGuard();
  const { user } = useAuth();
  const router = useRouter();
  const { data } = useQuery({
    queryKey: ["projects"],
    queryFn: () => app.service("projects").find({ query: {} }),
  });

  const exportData = async (participantId: string) => {
    const t = await app
      .service("export-tokens")
      .create({ query: JSON.stringify({ participantId }) });
    window.open(`http://${API_BASE_URL}/export/${t.token}`, "_blank");
  };

  const Participant = useMemo(() => {
    if (user?.type === "admin")
      return (props: {
        participant: Project["participants"][number];
        projectId: string;
      }) => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Link>{props.participant.id}</Link>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content size="1">
            <DropdownMenu.Item
              onClick={() =>
                router.push(
                  `/editor/?p=${props.participant.id}&pj=${props.projectId}`
                )
              }
            >
              Open in Editor
            </DropdownMenu.Item>
            <DropdownMenu.Item onClick={() => exportData(props.participant.id)}>
              Export data
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      );

    return (props: {
      participant: Project["participants"][number];
      projectId: string;
    }) => (
      <Link
        key={props.participant.id}
        href={`/editor/?p=${props.participant.id}&pj=${props.projectId}`}
      >
        {props.participant.id}
      </Link>
    );
  }, [user?.type]);

  return (
    <Container>
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between">
          <Heading>Projects</Heading>
        </Flex>
        {!data?.total && (
          <Callout.Root color="gray">
            <Callout.Text>No projects available</Callout.Text>
          </Callout.Root>
        )}
        {!!data?.total && (
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Project Id</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Participants</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Tagsets</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {data?.data?.map((d) => (
                <Table.Row key={d.id}>
                  <Table.Cell style={{ width: 180 }}>
                    {d.id}
                    {/* <Link href={`/projects/project/?id=${d.id}`}>{d.id}</Link> */}
                  </Table.Cell>
                  <Table.Cell>
                    <Flex direction="column">
                      {d.participants.map((p) => (
                        <Participant
                          key={p.id}
                          participant={p}
                          projectId={d.id}
                        />
                      ))}
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    <Flex direction="column">
                      {d.tagsetIds.map((id) => (
                        <TagSet key={id} id={id} />
                      ))}
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>
                    <Dialog.Root>
                      <Dialog.Trigger>
                        <IconButton variant="ghost">
                          <Pencil1Icon />
                        </IconButton>
                      </Dialog.Trigger>
                      <Dialog.Content>
                        <EditProject initialData={d} />
                      </Dialog.Content>
                    </Dialog.Root>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Flex>
    </Container>
  );
}
