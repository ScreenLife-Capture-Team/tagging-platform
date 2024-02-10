import { Box, Flex } from "@radix-ui/themes";
import { useQuery } from "@tanstack/react-query";
import { app } from "../client";
import { MouseEvent, useEffect, useId } from "react";
import { Tag } from "./Tag";
import { useEditor } from "../hooks/useEditor";

function fetchWithAuthentication(url: string, authToken: string) {
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${authToken}`);
  return fetch(url, { headers });
}

async function displayProtectedImage(
  imageId: string,
  imageUrl: string,
  authToken: string
) {
  // Fetch the image.
  const response = await fetchWithAuthentication(imageUrl, authToken);

  // Create an object URL from the data.
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  // Update the source of the image.
  const imageElement = document.getElementById(imageId) as HTMLImageElement;
  imageElement.src = objectUrl;
}

export function ImageContainer({
  id,
  selected,
  onClick,
  onMove,
  tagIds,
}: {
  id: string;
  selected: boolean;
  onClick: (e: MouseEvent<HTMLDivElement>) => void;
  onMove: (e: MouseEvent<HTMLDivElement>) => void;
  tagIds: number[];
}) {
  const { hideTags } = useEditor();
  // const { data: image } = useQuery({
  //   queryKey: ["images", id],
  //   queryFn: () => app.service("images").get(id),
  // });
  // if (!image) return <></>;
  const imageId = useId();
  useEffect(() => {
    const _ = async () => {
      displayProtectedImage(
        imageId,
        `http://localhost:3030/IMAGEID:${id}`,
        (await app.authentication.getAccessToken())!
      );
    };
    _();
  }, []);

  return (
    <Flex
      style={{
        position: "relative",
      }}
      onClick={onClick}
      onMouseMove={onMove}
    >
      <img
        id={imageId}
        // src={`http://localhost:3030/IMAGEID:${id}`}
        // src={`data:image/png;base64,${image.base64}`}
        width="100"
        height="100"
        style={{
          objectFit: "contain",
          // opacity: selectedImages.includes(i) ? 0.5 : 1,
        }}
        draggable={false}
      ></img>
      {selected && (
        <Box
          style={{
            height: "100%",
            width: "100%",
            backgroundColor: "blue",
            position: "absolute",
            opacity: 0.2,
          }}
        />
      )}
      <Flex
        style={{ position: "absolute", bottom: 0 }}
        align="start"
        justify="center"
        direction="column"
        gap="1"
      >
        {tagIds
          ?.filter((t) => !hideTags.includes(t))
          ?.map((tagId) => (
            <Tag tagId={tagId} key={tagId} />
          ))}
      </Flex>
    </Flex>
  );
}
