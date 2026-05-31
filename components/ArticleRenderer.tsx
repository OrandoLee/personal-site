import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { uiText } from "@/content/uiText";

type ArticleRendererProps = {
  content: string;
  emptyText?: string;
  className?: string;
};

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    "*": [
      ...(defaultSchema.attributes?.["*"] ?? []),
      "id",
      "className",
      "aria-hidden"
    ],
    input: [
      ...(defaultSchema.attributes?.input ?? []),
      ["type", "checkbox"],
      "checked",
      "disabled"
    ]
  }
};

function isExternalHref(href?: string) {
  return Boolean(href && /^https?:\/\//i.test(href));
}

const components: Components = {
  a({ href, children, ...props }) {
    const external = isExternalHref(href);

    return (
      <a
        {...props}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  },
  img({ src, alt, ...props }) {
    return (
      <img
        {...props}
        src={src ?? ""}
        alt={alt ?? ""}
        loading="lazy"
      />
    );
  }
};

export function ArticleRenderer({
  content,
  emptyText = uiText.articles.emptyPreview,
  className = ""
}: ArticleRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeSanitize, sanitizeSchema]]}
        components={components}
      >
        {content || emptyText}
      </ReactMarkdown>
    </div>
  );
}
