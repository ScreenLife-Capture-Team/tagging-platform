import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { app } from "../client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useHotkeys } from "react-hotkeys-hook";
import { useSearchParams } from "next/navigation";
import { Session } from "screenlife-platform-server";

const EditorContext = createContext<{
  sessionIndex: number;
  setSessionIndex: Dispatch<SetStateAction<number>>;
  sessions: {
    startDateTime: number;
    endDateTime: number;
    numberOfImages: number;
  }[];
  imageIndex: number;
  setImageIndex: Dispatch<SetStateAction<number>>;
  selectedImages: { id: string; tagIds: number[]; index: number }[];
  setSelectedImages: Dispatch<
    SetStateAction<{ id: string; tagIds: number[]; index: number }[]>
  >;
  data: Session[];
  images: Session["images"];
  singleMode?: boolean;
  commands: {
    nextImage: () => void;
    previousImage: () => void;
    nextSession: () => void;
    previousSession: () => void;
  };
  asUser?: number;
  setAsUser: Dispatch<SetStateAction<number | undefined>>;
  tagButtons: Record<string, number> | undefined;
  setTagButtons: Dispatch<SetStateAction<Record<string, number> | undefined>>;
  hideTags: number[];
  setHideTags: Dispatch<SetStateAction<number[]>>;
  focusOnTag: number | undefined;
  setFocusOnTag: Dispatch<SetStateAction<number | undefined>>;
}>({
  sessionIndex: 0,
  setSessionIndex: () => {},
  sessions: [],
  imageIndex: 0,
  setImageIndex: () => {},
  selectedImages: [],
  setSelectedImages: () => {},
  data: [],
  images: [],
  singleMode: false,
  commands: {
    nextImage: () => {},
    previousImage: () => {},
    nextSession: () => {},
    previousSession: () => {},
  },
  asUser: undefined,
  setAsUser: () => {},
  tagButtons: undefined,
  setTagButtons: () => {},
  hideTags: [],
  setHideTags: () => {},
  focusOnTag: undefined,
  setFocusOnTag: () => {},
});

export const EditorProvider = (props: PropsWithChildren) => {
  const projectId = useSearchParams().get("pj") as string;
  const queryClient = useQueryClient();
  const [sessionIndex, setSessionIndex] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [singleMode, setSingleMode] = useState(false);
  const [asUser, setAsUser] = useState<number | undefined>(undefined);
  const [tagButtons, setTagButtons] = useState<
    Record<string, number> | undefined
  >(undefined);
  const [hideTags, setHideTags] = useState<number[]>([]);
  const [focusOnTag, setFocusOnTag] = useState<number | undefined>(undefined);

  useEffect(() => {
    const raw = localStorage.getItem(`${projectId}-tagButtons`);
    if (!raw) return;
    try {
      setTagButtons(JSON.parse(raw));
    } catch (err: any) {
      console.warn("Failed to parse tagButtons", raw);
    }
  }, []);
  useEffect(() => {
    if (tagButtons !== undefined)
      localStorage.setItem(
        `${projectId}-tagButtons`,
        JSON.stringify(tagButtons)
      );
  }, [tagButtons]);

  const id = useSearchParams().get("p") as string | undefined;

  const { data } = useQuery({
    queryKey: ["sessions", sessionIndex, asUser],
    queryFn: () =>
      app.service("sessions").find({
        query: { participantId: id, index: sessionIndex, asUser },
      }),
    placeholderData: (previousData) => previousData,
  });
  const images = data?.data?.[0]?.images || [];

  useEffect(() => {
    if (!images.length) return;
    setSelectedImages(
      selectedImages.map((image) => ({
        ...image,
        tagIds: images.find((img) => img.id === image.id)?.tagIds || [],
      }))
    );
  }, [images]);

  const [selectedImages, setSelectedImages] = useState<
    { id: string; tagIds: number[]; index: number }[]
  >([]);

  const nextImage = () => {
    if (imageIndex < images.length - 1) {
      setImageIndex((i) => i + 1);
      setSelectedImages([{ ...images[imageIndex + 1], index: imageIndex + 1 }]);
    }
  };
  const previousImage = () => {
    if (imageIndex > 0) {
      setImageIndex((i) => i - 1);
      setSelectedImages([{ ...images[imageIndex - 1], index: imageIndex - 1 }]);
    }
  };

  const nextSession = () => {
    if (sessionIndex < 10) {
      setSessionIndex((i) => i + 1);
      setImageIndex(0);
    }
  };
  const previousSession = () => {
    if (sessionIndex > 0) {
      setSessionIndex((i) => i - 1);
      setImageIndex(0);
    }
  };

  useHotkeys("space", () => setSingleMode((s) => !s), [singleMode]);
  useHotkeys("right", nextImage, [imageIndex, images]);
  useHotkeys("left", previousImage, [imageIndex, images]);
  useHotkeys("shift+right", nextSession, [sessionIndex, images]);
  useHotkeys("shift+left", previousSession, [sessionIndex, images]);

  useHotkeys("1,2,3,4,5,6,7,8,9,0", async (_, handler) => {
    const keyNumber = handler?.keys?.join("");
    if (keyNumber === undefined) return;

    const tagId = tagButtons?.[keyNumber];
    if (tagId === undefined) return;

    await app.service("imageTags").tagImages({
      action: "add",
      imageIds: Array.from(new Set(selectedImages.map((image) => image.id))),
      tagId,
    });
    queryClient.refetchQueries({ queryKey: ["sessions"] });
  });
  useHotkeys(
    "shift+1,shift+2,shift+3,shift+4,shift+5,shift+6,shift+7,shift+8,shift+9,shift+0",
    async (_, handler) => {
      const keyNumber = handler?.keys?.join("");
      if (keyNumber === undefined) return;

      const tagId = tagButtons?.[keyNumber];
      if (tagId === undefined) return;

      await app.service("imageTags").tagImages({
        action: "remove",
        imageIds: Array.from(new Set(selectedImages.map((image) => image.id))),
        tagId,
      });
      queryClient.refetchQueries({ queryKey: ["sessions"] });
    }
  );
  return (
    <EditorContext.Provider
      value={{
        sessionIndex,
        setSessionIndex,
        sessions: data?.data?.[0]?.sessions || [],
        imageIndex,
        setImageIndex,
        selectedImages,
        setSelectedImages,
        data: data?.data || [],
        images:
          data?.data?.[0]?.images?.filter(
            (i) => focusOnTag === undefined || i.tagIds.includes(focusOnTag)
          ) || [],
        singleMode,
        commands: {
          nextImage,
          previousImage,
          nextSession,
          previousSession,
        },
        asUser,
        setAsUser,
        tagButtons: tagButtons || {},
        setTagButtons,
        hideTags,
        setHideTags,
        focusOnTag,
        setFocusOnTag,
      }}
    >
      {props.children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  return useContext(EditorContext);
};
