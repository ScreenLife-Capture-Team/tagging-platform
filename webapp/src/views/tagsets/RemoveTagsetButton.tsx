import { Dialog, Button, Flex, IconButton } from "@radix-ui/themes";
import { useQueryClient } from "@tanstack/react-query";
import { app } from "../../client";
import { TrashIcon } from "@radix-ui/react-icons";

export default function RemoveTagsetButton({ id }: { id: number }) {
  const queryClient = useQueryClient();

  const remove = async (id: number) => {
    await app.service("tagsets").remove(id);
    queryClient.refetchQueries({ queryKey: ["tagsets"] });
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <IconButton variant="ghost" color="red">
          <TrashIcon />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Deleting Tagset</Dialog.Title>
        <Dialog.Description>
          Are you sure you want to remove this tagset?
        </Dialog.Description>
        <Dialog.Close>
          <Flex justify="end" gap="4" align="center">
            <Button variant="ghost">Cancel</Button>
            <Button color="red" onClick={() => remove(id)}>
              Confirm
            </Button>
          </Flex>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Root>
  );
}
