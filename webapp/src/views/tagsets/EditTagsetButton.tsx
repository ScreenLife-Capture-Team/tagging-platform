import {
  Dialog,
  Button,
  Flex,
  IconButton,
  TextField,
  Text,
  Heading,
  Popover,
  Table,
} from "@radix-ui/themes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { app } from "../../client";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import { Tag } from "../../components/Tag";
import { ReactElement, useState } from "react";

type FormData = {
  name: string;
};

function EditTagButton({
  tagId,
  tagsetId,
  children,
}: {
  tagId?: number;
  tagsetId: number;
  children: React.ReactNode;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#000000");
  const queryClient = useQueryClient();
  const { isLoading } = useQuery({
    queryKey: ["tags", tagId],
    queryFn: async () => {
      const res = await app.service("tags").get(tagId!);
      setName(res.name);
      setColor(res.color || "#000000");
      return res;
    },
    enabled: !!tagId,
  });
  const submit = async () => {
    if (!tagId) {
      await app.service("tags").create({
        name,
        tagsetId: tagsetId,
        color,
      });
    } else {
      await app.service("tags").patch(tagId, {
        name,
        color,
      });
    }
    await queryClient.refetchQueries({
      queryKey: ["tags-in-tagset", tagsetId],
    });
    await queryClient.refetchQueries({
      queryKey: ["tags", tagId],
    });
    document.getElementById("close-button")?.click();
  };

  if (!!tagId && isLoading) return <></>;

  return (
    <Popover.Root>
      <Popover.Trigger style={{ cursor: "pointer" }}>
        {children}
      </Popover.Trigger>
      <Popover.Content>
        <Flex direction="column" gap="2">
          <TextField.Root>
            <TextField.Slot>
              <Text size="2">Name</Text>
            </TextField.Slot>
            <TextField.Input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </TextField.Root>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
          <Flex justify="end" gap="3" align="center">
            <Popover.Close>
              <Button id="close-button" variant="ghost">
                Close
              </Button>
            </Popover.Close>
            <Button onClick={submit}>Confirm</Button>
          </Flex>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}

export default function EditTagsetButton({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      name: "",
    },
  });

  useQuery({
    queryKey: ["tagsets", id],
    queryFn: async () => {
      const res = await app.service("tagsets").get(id);
      reset({ name: res.name });
      return res;
    },
  });

  const { data: tags } = useQuery({
    queryKey: ["tags-in-tagset", id],
    queryFn: async () => {
      const res = await app.service("tags").find({ query: { tagsetId: id } });
      return res;
    },
  });

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <IconButton variant="ghost">
          <Pencil1Icon />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Edit Tagset</Dialog.Title>
        <TextField.Root style={{ width: 240 }}>
          <TextField.Slot>
            <Text size="2">Name</Text>
          </TextField.Slot>
          <TextField.Input {...register("name")} />
        </TextField.Root>

        <Flex direction="column" my="4" align="start" gap="1">
          <Flex gap="3" align="center">
            <Heading size="4">Tags</Heading>
            <EditTagButton tagsetId={id}>
              <Button variant="ghost" size="1">
                +
              </Button>
            </EditTagButton>
          </Flex>
          <Table.Root size="1">
            <Table.Body>
              {tags?.data?.map((t) => (
                <Table.Row key={t.id}>
                  <Table.Cell>
                    <Tag tagId={t.id} />
                  </Table.Cell>

                  <Table.Cell>
                    <Flex direction="row" gap="3">
                      <EditTagButton key={t.id} tagId={t.id} tagsetId={id}>
                        <IconButton size="1" variant="ghost">
                          <Pencil1Icon />
                        </IconButton>
                      </EditTagButton>
                      <IconButton
                        size="1"
                        variant="ghost"
                        color="red"
                        onClick={async () => {
                          await app.service("tags").remove(t.id);
                          await queryClient.refetchQueries({
                            queryKey: ["tags-in-tagset", id],
                          });
                        }}
                      >
                        <TrashIcon />
                      </IconButton>
                    </Flex>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Flex>

        <Dialog.Close>
          <Flex justify="end" gap="4" align="center">
            <Button variant="ghost">Cancel</Button>
          </Flex>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
}
