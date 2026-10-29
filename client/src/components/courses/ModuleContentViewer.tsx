import { Video, Image, FileText, Download, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils.ts';
import { hasHtmlTags, sanitizeHtml } from '@/lib/sanitize.ts';

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

/** Pictures and videos never grow taller than this, however wide the page is. */
const MEDIA_MAX_HEIGHT = 'max-h-[min(28rem,70vh)]';

function ContentBlock({ block }: { block: ModuleContent }) {
  switch (block.type) {
    case 'text':
      return (
        <div className="text-foreground">
          {block.content ? (
            <div
              // Plain-text blocks from before the editor keep their line breaks.
              className={cn('rich-content', !hasHtmlTags(block.content) && 'whitespace-pre-wrap')}
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content) }}
            />
          ) : (
            <p className="text-muted-foreground italic">(no content)</p>
          )}
        </div>
      );
    case 'video': {
      const url = isWebUrl(block.url) ? block.url : '';
      return (
        <div className="overflow-hidden rounded-xl border border-input bg-black">
          {url ? (
            <video
              controls
              className={cn('mx-auto block w-full bg-black', MEDIA_MAX_HEIGHT)}
              poster={block.resource_type === 'image' ? url : undefined}
            >
              <source src={url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center bg-background text-muted-foreground">
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
        <div className="flex justify-center overflow-hidden rounded-xl border border-input bg-muted/30">
          {url ? (
            <img
              src={url}
              alt={block.title ?? 'Image'}
              className={cn('block h-auto w-auto max-w-full object-contain', MEDIA_MAX_HEIGHT)}
            />
          ) : (
            <div className="flex h-48 w-full flex-col items-center justify-center text-muted-foreground">
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

/**
 * The content blocks of one module, flowing as part of the module itself: no box or badge per
 * block, just a divider under the lesson notes and consistent spacing between blocks.
 */
export function ModuleContentViewer({
  contents,
}: {
  contents: ModuleContent[];
}) {
  if (!contents || contents.length === 0) return null;

  return (
    <div className="space-y-5 border-t border-input pt-4">
      {contents.map((block) => {
        // File and link blocks already show their own title inside the row.
        const showTitle =
          !!block.title && (block.type === 'text' || block.type === 'video' || block.type === 'image');
        const videoUrl = block.type === 'video' && isWebUrl(block.url) ? block.url : '';
        return (
          <div key={block.id} className="space-y-2">
            {(showTitle || videoUrl) && (
              <div className="flex items-baseline justify-between gap-3">
                {showTitle ? <h4 className="font-semibold">{block.title}</h4> : <span />}
                {videoUrl && (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs text-primary hover:underline"
                  >
                    Open in new tab
                  </a>
                )}
              </div>
            )}
            <ContentBlock block={block} />
          </div>
        );
      })}
    </div>
  );
}
