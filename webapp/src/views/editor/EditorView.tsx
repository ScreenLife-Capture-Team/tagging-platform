"use client";
import {
  Badge,
  Button,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
  ScrollArea,
  Separator,
  Text,
} from "@radix-ui/themes";
import { MouseEvent } from "react";
import { TagsSelector } from "./TagsSelector";
import { ImageContainer } from "../../components/ImageContainer";
import { EditorProvider, useEditor } from "../../hooks/useEditor";
import { useRouter } from "next/navigation";
import { useAuthGuard } from "../../hooks/useAuthGuard";
import { useAuth } from "../../store/useAuth";
import { UserSelector } from "./UserSelector";
import { Tag } from "../../components/Tag";
import { Cross1Icon } from "@radix-ui/react-icons";
import { app } from "../../client";
import { useQueryClient } from "@tanstack/react-query";

export default function EditorViewWrapper() {
  useAuthGuard();
  return (
    <EditorProvider>
      <EditorView />
    </EditorProvider>
  );
}

function EditorView() {
  const {
    asUser,
    setAsUser,
    images,
    sessions,
    sessionIndex,
    imageIndex,
    setImageIndex,
    selectedImages,
    setSelectedImages,
    singleMode,
    commands: { nextImage, nextSession, previousImage, previousSession },
    focusOnTag,
    setFocusOnTag,
  } = useEditor();

  const onImageMove = ({
    e,
    imageIndex: selectedImageIndex,
  }: {
    e: MouseEvent<HTMLDivElement>;
    imageIndex: number;
  }) => {};

  const onImagePress = ({
    e,
    imageIndex: selectedImageIndex,
  }: {
    e: MouseEvent<HTMLDivElement>;
    imageIndex: number;
  }) => {
    if (e.metaKey || e.ctrlKey) {
      if (!selectedImages.map((i) => i.index).includes(selectedImageIndex)) {
        setSelectedImages((s) => [
          ...s,
          { ...images[selectedImageIndex], index: selectedImageIndex },
        ]);
      } else {
        setSelectedImages((s) =>
          s.filter(({ index }) => index !== selectedImageIndex)
        );
      }
    } else if (e.shiftKey) {
      const cur = Math.min(imageIndex, selectedImageIndex);
      const end = Math.max(imageIndex, selectedImageIndex);
      const ls: { index: number; id: string; tagIds: number[] }[] = [];
      for (let c = cur; c <= end; c++) {
        if (images?.[c]) ls.push({ ...images[c], index: c });
      }
      setSelectedImages((s) => [...s, ...ls]);
    } else {
      if (
        selectedImages.length > 1 ||
        !selectedImages.map((i) => i.index).includes(selectedImageIndex)
      ) {
        setSelectedImages([
          { ...images[selectedImageIndex], index: selectedImageIndex },
        ]);
      } else {
        setSelectedImages([]);
      }
    }
    setImageIndex(selectedImageIndex);
  };

  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  return (
    <Flex direction="column" style={{ flex: 1, height: "100vh" }}>
      <Flex p="2" align="center" justify="between">
        <Flex gap="6" align="center">
          <Heading size="3">ScreenLife Tagging Platform</Heading>
          <Flex gap="4">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="ghost" color="gray" size="1">
                  Project
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content size="1">
                <DropdownMenu.Item onClick={() => router.push("/projects")}>
                  Back to Projects
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="ghost" color="gray" size="1">
                  Selection
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content size="1">
                <DropdownMenu.Item>Select</DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="ghost" color="gray" size="1">
                  AutoTag
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content size="1">
                <DropdownMenu.Item
                  onClick={async () => {
                    await app.service("imageTags").autoTagImages({
                      imageIds: Array.from(
                        new Set(selectedImages.map((image) => image.id))
                      ),
                    });
                    queryClient.refetchQueries({ queryKey: ["sessions"] });
                  }}
                >
                  Tag Selected Images
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Flex>
        </Flex>
        <UserSelector onChangeUser={setAsUser} asUser={asUser} />
      </Flex>
      <Separator size="4" />
      <Flex p="2" gap="2">
        <Flex gap="1">
          <Button
            size="1"
            variant="soft"
            color="gray"
            onClick={previousSession}
          >
            {`<`}
          </Button>
          <Badge color="gray">
            Session: {sessionIndex + 1} / {sessions.length}
          </Badge>
          <Button size="1" variant="soft" color="gray" onClick={nextSession}>
            {`>`}
          </Button>
        </Flex>
        <Flex gap="1">
          <Button size="1" variant="soft" color="gray" onClick={previousImage}>
            {`<`}
          </Button>
          <Badge color="gray">
            Image: {imageIndex + 1} / {images.length}
          </Badge>
          <Button size="1" variant="soft" color="gray" onClick={nextImage}>
            {`>`}
          </Button>
        </Flex>
        {focusOnTag && (
          <Flex gap="2" mx="4" align="center">
            <Text size="2">Currently only showing images with:</Text>
            <Tag tagId={focusOnTag} />
            <IconButton
              variant="ghost"
              size="1"
              color="gray"
              onClick={() => setFocusOnTag(undefined)}
            >
              <Cross1Icon />
            </IconButton>
          </Flex>
        )}
      </Flex>
      <Separator size="4" />
      <Flex style={{ flex: 1, height: "100%" }}>
        <TagsSelector selectedImages={selectedImages} />
        <Separator size="4" orientation="vertical" />
        {singleMode ? (
          <Flex align="center" justify="center" style={{ flex: 1 }}>
            {/* <img
              src={images?.[imageIndex]}
              width="500"
              height="500"
              style={{ objectFit: "contain" }}
            ></img> */}
          </Flex>
        ) : (
          <ScrollArea style={{ backgroundColor: "#fafafa" }}>
            <Flex style={{ flex: 1 }} wrap="wrap" p="2">
              {images.map((image, i) => {
                return (
                  <ImageContainer
                    key={image.id}
                    id={image.id}
                    selected={selectedImages
                      .map((i) => i.id)
                      .includes(image.id)}
                    tagIds={image.tagIds}
                    onClick={(e) => onImagePress({ e, imageIndex: i })}
                    onMove={(e) => onImageMove({ e, imageIndex: i })}
                  />
                );
              })}
            </Flex>
          </ScrollArea>
        )}
      </Flex>
    </Flex>
  );
}
