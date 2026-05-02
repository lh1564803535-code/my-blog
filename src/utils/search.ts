)export interface SearchItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
}

export function searchPosts(posts: SearchItem[], query: string): SearchItem[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return posts;

  return posts.filter(
    (post) =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.description.toLowerCase().includes(lowerQuery) ||
      post.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}
