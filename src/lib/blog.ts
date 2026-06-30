import fs from "fs";
import path from "path";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: string;
  tag: string;
  coverImage: string;
}

// Simple regex frontmatter parser
const frontMatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

function parseMarkdown(fileContent: string): { data: Record<string, string>; content: string } {
  const match = fileContent.match(frontMatterRegex);
  if (!match) {
    return { data: {}, content: fileContent };
  }

  const yamlLines = match[1].split("\n");
  const data: Record<string, string> = {};
  for (const line of yamlLines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.substring(0, colonIndex).trim();
      const value = line
        .substring(colonIndex + 1)
        .trim()
        .replace(/^['"]|['"]$/g, ""); // strip quotes
      data[key] = value;
    }
  }

  return { data, content: match[2].trim() };
}

export function getBlogPosts(): BlogPost[] {
  const blogDir = path.join(process.cwd(), "content/blog");

  if (!fs.existsSync(blogDir)) {
    return [];
  }

  const files = fs.readdirSync(blogDir).filter((file) => file.endsWith(".md"));

  const posts = files.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(blogDir, fileName);
    const fileContent = fs.readFileSync(fullPath, "utf8");
    const { data, content } = parseMarkdown(fileContent);

    return {
      slug,
      title: data.title || "",
      excerpt: data.excerpt || "",
      content: content || "",
      author: data.author || "",
      date: data.date || "",
      readTime: data.readTime || "",
      tag: data.tag || "",
      coverImage: data.coverImage || "",
    };
  });

  // Sort posts by date (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  const posts = getBlogPosts();
  return posts.find((post) => post.slug === slug);
}
