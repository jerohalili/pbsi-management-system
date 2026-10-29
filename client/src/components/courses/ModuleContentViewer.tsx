import { Video, Image, FileText, Download, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge.tsx';
import { Card } from '@/components/ui/card.tsx';

export interface ModuleContent {
  id: string;
  module_id: string;
  type: 'text' | 'video' | 'image' | 'file' | 'link';
  title: string | null;
  content: string | null;
  url: string | null;
  cloudinary_public_id: string | null;
  resource_type: string | null;
  order_index: number;
  created_at: string;
}

const isWebUrl = (value: string | null | undefined): value is string =>
  !!value && /^https?:\/\//i.test(value);

function ContentBlock({ block }: { block: ModuleContent }) {
  switch (block.type) {
    case 'text':
      return (
        <div className="prose prose-sm max-w-none text-foreground">
          {block.content ? (
            <div
              className="whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          ) : (
            <p className="text-muted-foreground italic">(no content)</p>
          )}
        </div>
      );
    case 'video': {
      const url = isWebUrl(block.url) ? block.url : '';
      return (
        <div className="rounded-xl border border-input bg-background overflow-hidden aspect-video">
          {url ? (
            <video
              controls
              className="w-full h-full"
              poster={block.resource_type === 'image' ? url : undefined}
            >
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <Video className="w-12 h-12 mb-2" />
              <p>Video not available</p>
            </div>
          )}
        </div>
      );
    }
    case 'image': {
      const url = isWebUrl(block.url) ? block.url : '';
      return (
        <div className="rounded-xl border border-input bg-background overflow-hidden">
          {url ? (
            <img src={url} alt={block.title ?? 'Image'} className="w-full h-auto max-h-96 object-cover" />
          ) : (
            <div className="flex h-48 flex-col items-center justify-center text-muted-foreground">
              <Image className="w-12 h-12 mb-2" />
              <p>Image not available</p>
            </div>
          )}
        </div>
      );
    }
    case 'file': {
      const url = isWebUrl(block.url) ? block.url : '';
      return (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-input bg-background">
          <div className="flex shrink-0 items-center justify-center w-12 h-12 rounded-lg bg-muted/50 text-muted-foreground">
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{block.title ?? 'File'}</p>
            {block.resource_type && (
              <p className="text-xs text-muted-foreground truncate">{block.resource_type}</p>
            )}
          </div>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Download className="w-4 h-4" /> Open file
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          ) : null}
        </div>
      );
    }
    case 'link': {
      const url = isWebUrl(block.url) ? block.url : '';
      return (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-input bg-primary/5">
          <div className="flex shrink-0 items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
            <ExternalLink className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{block.title ?? 'Link'}</p>
            {url && <p className="text-xs text-muted-foreground truncate">{url}</p>}
          </div>
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Open link <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          ) : null}
        </div>
      );
    }
  }
}

const typeLabel: Record<string, string> = {
  text: 'Text',
  video: 'Video',
  image: 'Image',
  file: 'File',
  link: 'Link',
};

export function ModuleContentViewer({
  contents,
}: {
  contents: ModuleContent[];
}) {
  if (!contents || contents.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">Contents</h2>
      <div className="space-y-3">
        {contents.map((block) => (
          <Card key={block.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {typeLabel[block.type]}
                </Badge>
                {block.title && (
                  <h3 className="font-semibold">{block.title}</h3>
                )}
              </div>
              <div className="flex shrink-0 gap-1">
                {block.type === 'video' && isWebUrl(block.url) && (
                  <a
                    href={block.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Open in new tab
                  </a>
                )}
              </div>
            </div>
            <div className="mt-3">{<ContentBlock block={block} />}</div>
          </Card>
        ))}
      </div>
    </section>
  );
}
