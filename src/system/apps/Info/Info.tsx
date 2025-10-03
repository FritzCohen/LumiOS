import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import "./Info.css";

const Info = () => {
    const [markdownContent, setMarkdownContent] = useState<string>('');

    useEffect(() => {
        const fetchMarkdown = async () => {
            try {
                const response = await fetch(
                    'https://raw.githubusercontent.com/LuminesenceProject/LumiOS/refs/heads/main/README.md'
                );
                const markdown = await response.text();

                // Fix relative image paths to absolute paths if needed
                const fixedMarkdown = markdown.replace(
                    /!\[([^\]]*)\]\((\/[^)]+)\)/g,
                    `![$1](https://raw.githubusercontent.com/LuminesenceProject/LumiOS/refs/heads/main$2)`
                );

                setMarkdownContent(fixedMarkdown);
            } catch (error) {
                console.error('Error fetching markdown:', error);
            }
        };

        fetchMarkdown();
    }, []);

    return (
        <div className="markdown-container">
            <Markdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                className="markdown"
                components={{
                    img: ({ src, alt }) => (
                        <img
                            src={src || ''}
                            alt={alt || ''}
                            loading="lazy"
                            className="markdown-image"
                        />
                    ),
                }}
            >
                {markdownContent}
            </Markdown>
        </div>
    );
};

export default Info;