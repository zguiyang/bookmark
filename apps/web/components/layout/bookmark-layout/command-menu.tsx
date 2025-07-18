'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchIcon, Bookmark, Heart, Tag as TagIcon, Folder, Loader2 } from 'lucide-react';

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import { BookmarkApi } from '@/api';
import { BookmarkSearchResponse, BookmarkFavoriteEnum } from '@bookmark/schemas';

// 简单的加载组件实现
const CommandLoading = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      {children}
    </div>
  );
};

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<BookmarkSearchResponse | null>(null);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const fetchSearchResults = async () => {
        setIsLoading(true);
        const { success, data } = await BookmarkApi.search({ keyword: searchTerm });
        if (success && data) {
          setSearchResults(data);
        }
        setIsLoading(false);
      };

      const timer = setTimeout(() => {
        fetchSearchResults();
      }, 300);

      return () => clearTimeout(timer);
    } else {
      setSearchResults(null);
    }
  }, [searchTerm]);

  const handleSelect = (callback: () => void) => {
    callback();
    setOpen(false);
  };

  const navigateToBookmark = (url: string) => {
    window.open(url, '_blank');
  };

  const navigateToCategory = (categoryId: string) => {
    router.push(`/categories/${categoryId}`);
  };

  const navigateToTag = (tagId: string) => {
    router.push(`/tags/${tagId}`);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-lg border border-input bg-gray-50 dark:bg-gray-900 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <div className="flex items-center gap-2">
          <SearchIcon className="h-4 w-4" />
          <span>搜索书签...</span>
        </div>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command
          shouldFilter={false}
          loop
          className="bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md"
        >
          <CommandInput placeholder="搜索书签、分类或标签..." value={searchTerm} onValueChange={setSearchTerm} />
          <CommandList>
            {isLoading && <CommandLoading>搜索中...</CommandLoading>}
            {!isLoading && searchTerm && !searchResults && <CommandEmpty>未找到相关结果</CommandEmpty>}
            {!isLoading && !searchTerm && <CommandEmpty>请输入关键词开始搜索</CommandEmpty>}
            {!isLoading && searchResults && (
              <>
                <CommandGroup heading="书签" className="overflow-hidden">
                  {searchResults.bookmarks.map((bookmark) => (
                    <CommandItem
                      key={bookmark._id}
                      value={`bookmark-${bookmark._id}`}
                      className="flex items-center justify-between cursor-pointer"
                      onSelect={() => handleSelect(() => navigateToBookmark(bookmark.url))}
                    >
                      <div className="flex items-center">
                        {bookmark.icon ? (
                          <img src={bookmark.icon} alt="" className="mr-2 h-4 w-4 bg-gray-100 dark:bg-gray-500" />
                        ) : (
                          <div className="mr-2 h-4 w-4 flex items-center justify-center rounded bg-primary/10">
                            <Bookmark className="h-3 w-3 text-primary" />
                          </div>
                        )}
                        <span>{bookmark.title}</span>
                      </div>
                      {bookmark.isFavorite === BookmarkFavoriteEnum.YES && (
                        <CommandShortcut>
                          <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                        </CommandShortcut>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="分类">
                  {searchResults.categories.map((category) => (
                    <CommandItem
                      key={category._id}
                      value={`category-${category._id}`}
                      onSelect={() => handleSelect(() => navigateToCategory(category._id))}
                    >
                      <Folder className="mr-2 h-4 w-4" />
                      <span>{category.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>

                <CommandSeparator />

                <CommandGroup heading="标签">
                  {searchResults.tags.map((tag) => (
                    <CommandItem
                      key={tag._id}
                      value={`tag-${tag._id}`}
                      onSelect={() => handleSelect(() => navigateToTag(tag._id))}
                    >
                      <TagIcon className="mr-2 h-4 w-4" style={tag.color ? { color: tag.color } : undefined} />
                      <span>{tag.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}

            <CommandSeparator />
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
