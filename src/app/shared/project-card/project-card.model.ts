export interface ProjectLink {
  href: string;
  label: string;
}

export type ProjectMedia =
  | { kind: 'image'; src: string; alt: string; width: number; height: number }
  | {
      kind: 'video';
      src: string;
      poster: string;
      description: string;
      width: number;
      height: number;
      captions?: { src: string; language: string; label: string };
    };

interface ProjectDetails {
  id: string;
  category: string;
  title: string;
  problem: string | null;
  solution: string | null;
  technologies: readonly string[];
}

// Reserved slots cannot carry a demo link or a media asset that suggests a completed project.
export type ProjectCardData = ProjectDetails &
  (
    | { status: 'placeholder'; media: { kind: 'placeholder' }; link?: never }
    | { status: 'demo' | 'case'; media: ProjectMedia; link?: ProjectLink }
  );
