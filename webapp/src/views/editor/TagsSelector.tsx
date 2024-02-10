import {
  Flex,
  Callout,
  Inset,
  Separator,
  Text,
  Badge,
  ContextMenu,
  Dialog,
  Kbd,
  IconButton,
} from "@radix-ui/themes";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { app } from "../../client";
import { Tagset } from "screenlife-platform-server";
import { Tag } from "screenlife-platform-server";
import { Tag as TagButton } from "../../components/Tag";
import { Dispatch, SetStateAction, useState } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  EyeClosedIcon,
  EyeOpenIcon,
} from "@radix-ui/react-icons";
import { produce } from "immer";
import { useEditor } from "../../hooks/useEditor";
import { useSearchParams } from "next/navigation";

function TagSet({
  tagset,
  onNewTagPress,
}: {
  tagset: Tagset;
  onNewTagPress: (t: Tag) => Promise<void>;
}) {
  const [open, setOpen] = useState(true);
  const [hide, setHide] = useState(false);
  const { tagButtons, setTagButtons, setHideTags, setFocusOnTag } = useEditor();
  const { data: tags } = useQuery({
    queryKey: ["tagset", tagset.id],
    queryFn: () => app.service("tags").find({ query: { tagsetId: tagset.id } }),
  });

  const bind = (key: number | null, tagId: number) => {
    setTagButtons((tb) => {
      return produce(tb, (draft) => {
        if (!draft) draft = {};

        for (const k of Object.keys(draft))
          if (draft[k] === tagId) delete draft[k];

        if (key !== null) draft[key.toString()] = tagId;
      });
    });
  };

  return (
    <Flex direction="column" gap="2">
      <Flex justify="between" align="center">
        <Text size="2">{tagset.name}</Text>
        <Flex gap="2">
          <IconButton
            variant="ghost"
            color="gray"
            size="1"
            onClick={() => {
              if (hide) {
                // show
                setHideTags((t) =>
                  t.filter((id) => !tags?.data?.map((d) => d.id).includes(id))
                );
              } else {
                // hide
                setHideTags((t) => [
                  ...t,
                  ...(tags?.data?.map((d) => d.id) || []),
                ]);
              }
              setHide((o) => !o);
            }}
          >
            {hide ? <EyeClosedIcon /> : <EyeOpenIcon />}
          </IconButton>
          <IconButton
            variant="ghost"
            color="gray"
            size="1"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <ChevronDownIcon /> : <ChevronUpIcon />}
          </IconButton>
        </Flex>
      </Flex>

      {open && (
        <Flex gap="2" wrap="wrap" mb="3">
          {tags?.data?.map((t) => {
            return (
              <ContextMenu.Root key={t.id}>
                <ContextMenu.Trigger>
                  <Flex
                    onClick={() => {
                      if (!hide) onNewTagPress(t);
                    }}
                    style={{
                      cursor: hide ? undefined : "pointer",
                      opacity: hide ? 0.2 : 1,
                    }}
                    gap="1"
                  >
                    <TagButton tagId={t.id} />
                    {Object.values(tagButtons || {}).some((v) => v === t.id) ? (
                      <Kbd size="1">
                        {
                          Object.entries(tagButtons || {}).find(
                            ([key, value]) => value === t.id
                          )?.[0]!
                        }
                      </Kbd>
                    ) : (
                      <></>
                    )}
                  </Flex>
                </ContextMenu.Trigger>
                <ContextMenu.Content size="1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((i) => (
                    <ContextMenu.Item key={i} onClick={() => bind(i, t.id)}>
                      <Flex>
                        Bind to <Kbd ml="2">{i}</Kbd>
                      </Flex>
                    </ContextMenu.Item>
                  ))}
                  <ContextMenu.Item onClick={() => bind(null, t.id)}>
                    Clear Keybind
                  </ContextMenu.Item>
                  <ContextMenu.Separator />
                  <ContextMenu.Item onClick={() => setFocusOnTag(t.id)}>
                    Only show images with this tag
                  </ContextMenu.Item>
                </ContextMenu.Content>
              </ContextMenu.Root>
            );
          })}
        </Flex>
      )}
    </Flex>
  );
}

export function TagsSelector({
  selectedImages,
}: {
  selectedImages: { id: string; tagIds: number[] }[];
}) {
  const projectId = useSearchParams().get("pj") as string;
  const { hideTags } = useEditor();
  const queryClient = useQueryClient();
  const existingTags = Array.from(
    new Set(selectedImages.flatMap((image) => image.tagIds).filter((t) => !!t))
  );

  const { data: project } = useQuery({
    queryKey: ["project"],
    queryFn: () => app.service("projects").get(projectId),
  });

  const { data: tagsets } = useQuery({
    queryKey: ["tagsets", project],
    queryFn: () =>
      app
        .service("tagsets")
        .find({ query: { id: { $in: project!.tagsetIds } } }),
    enabled: !!project,
  });

  const { data: tags } = useQuery({
    queryKey: ["tags"],
    queryFn: () => app.service("tags").find({}),
  });

  const onNewTagPress = async (t: Tag) => {
    await app.service("imageTags").tagImages({
      action: "add",
      imageIds: Array.from(new Set(selectedImages.map((image) => image.id))),
      tagId: t.id,
    });
    queryClient.refetchQueries({ queryKey: ["sessions"] });
  };

  const onExistingTagPress = async (t: Tag) => {
    await app.service("imageTags").tagImages({
      action: "remove",
      imageIds: Array.from(new Set(selectedImages.map((image) => image.id))),
      tagId: t.id,
    });
    queryClient.refetchQueries({ queryKey: ["sessions"] });
  };

  return (
    <Flex direction="column" p="2" style={{ width: 200 }}>
      <Text size="2" mb="2" weight="bold">
        Current Tags
      </Text>
      {existingTags.length === 0 ? (
        <Callout.Root size="1" color="yellow" variant="outline">
          <Callout.Text>No tags for the current image(s)</Callout.Text>
        </Callout.Root>
      ) : (
        <Flex gap="1" wrap="wrap">
          {existingTags.map((tagId) => {
            return (
              <Flex
                onClick={() => {
                  if (!hideTags.includes(tagId))
                    onExistingTagPress(tags?.data.find((t) => t.id === tagId)!);
                }}
                key={tagId}
                style={{
                  cursor: hideTags.includes(tagId) ? undefined : "pointer",
                  opacity: hideTags.includes(tagId) ? 0.4 : 1,
                }}
                gap="1"
              >
                <TagButton tagId={tagId} />
              </Flex>
            );
          })}
        </Flex>
      )}
      <Inset side="x" mx="-2">
        <Separator size="4" my="2" mt="4" />
      </Inset>
      <Text size="2" mb="2" weight="bold">
        Available Tags
      </Text>

      <Flex direction="column" gap="2">
        {tagsets?.data?.map((tagset) => (
          <TagSet
            key={tagset.id}
            tagset={tagset}
            onNewTagPress={onNewTagPress}
          />
        ))}
      </Flex>

      {tags?.total === 0 && (
        <Callout.Root size="1" color="yellow" variant="outline">
          <Callout.Text>No available tags</Callout.Text>
        </Callout.Root>
      )}
    </Flex>
  );
}
