export type groupNameType = [string, string];

type SimpleSnippet = {
  group: string;
  name: string;
};

export type Snippet = {
  group: string;
  name: string;
  description: string;
  subSnippets: SimpleSnippet[];
  nodeVersion?: string;
  npmVersion?: {
    name: string;
    version: string;
  };
};