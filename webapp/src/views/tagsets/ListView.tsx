"use client";
import { Container, Flex, Heading, Table } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { app } from "../../client";
import AddTagsetButton from "./AddTagsetButton";
import RemoveTagsetButton from "./RemoveTagsetButton";
import EditTagsetButton from "./EditTagsetButton";
import { Tag } from "../../components/Tag";
import { useAuthGuard } from "../../hooks/useAuthGuard";

function Tags({ tagsetId }: { tagsetId: number }) {
  const { data: tags } = useQuery({
    queryKey: ["tags-in-tagset", tagsetId],
    queryFn: async () => {
      const res = await app.service("tags").find({ query: { tagsetId } });
      return res;
    },
  });

  return (
    <Flex gap="1">
      {tags?.data?.map((t) => (
        <Tag tagId={t.id} key={t.id} />
      ))}
    </Flex>
  );
}

export default function ListView() {
  useAuthGuard();
  const { data } = useQuery({
    queryKey: ["tagsets"],
    queryFn: () => app.service("tagsets").find({ query: {} }),
  });

  return (
    <Container>
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between">
          <Heading>Tagsets</Heading>
          <AddTagsetButton />
        </Flex>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Tags</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data?.data?.map((d) => (
              <Table.Row key={d.id}>
                <Table.Cell>{d.name}</Table.Cell>
                <Table.Cell>
                  <Tags tagsetId={d.id} />
                </Table.Cell>
                <Table.Cell justify="end">
                  <Flex justify="end" gap="4">
                    <EditTagsetButton id={d.id} />
                    <RemoveTagsetButton id={d.id} />
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Flex>
    </Container>
  );
}
