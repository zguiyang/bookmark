import type { FastifyInstance } from 'fastify';
import {
  CreateBookmarkBody,
  UpdateBookmarkBody,
  BookmarkIdParam,
  SetFavoriteBody,
  SetPinnedBody,
  UpdateLastVisitTimeBody,
  BookmarkSearchQuery,
  BookmarkPageListQuery,
  BookmarkImportBody,
} from '@bookmark/schemas';
import { bookmarkSchemas } from './bookmark.schema.js';
import { TagService } from './tag/tag.service.js';
import { CategoryService } from './category/category.service.js';
import { WebsiteMetaService } from '../website/website-meta.service.js';
import { BookmarkService } from './bookmark.service.js';

export default async function bookmarkRoutes(fastify: FastifyInstance) {
  const bookmarkService = new BookmarkService(new CategoryService(), new TagService(), new WebsiteMetaService());

  fastify.post<{ Body: CreateBookmarkBody }>('/create', {
    schema: bookmarkSchemas.create,
    handler: (req) => {
      const { currentUser, body } = req;
      return bookmarkService.create(currentUser.id, body);
    },
  });

  fastify.put<{ Body: UpdateBookmarkBody }>('/update', {
    schema: bookmarkSchemas.update,
    handler: (req) => {
      const { currentUser, body } = req;
      return bookmarkService.update(currentUser.id, body);
    },
  });

  fastify.delete<{ Params: BookmarkIdParam }>('/delete/:id', {
    schema: bookmarkSchemas.delete,
    handler: (req) => {
      const { currentUser, params } = req;
      return bookmarkService.delete(currentUser.id, params.id);
    },
  });

  fastify.patch<{ Body: SetFavoriteBody }>('/favorite', {
    schema: bookmarkSchemas.favorite,
    handler: (req) => {
      const { currentUser, body } = req;
      return bookmarkService.favorite(currentUser.id, body);
    },
  });

  fastify.patch<{ Body: SetPinnedBody }>('/pinned', {
    schema: bookmarkSchemas.pinned,
    handler: (req) => {
      const { currentUser, body } = req;
      return bookmarkService.pinned(currentUser.id, body);
    },
  });

  fastify.get('/all', {
    schema: bookmarkSchemas.all,
    handler: (req) => {
      const { currentUser } = req;
      return bookmarkService.findAll(currentUser.id);
    },
  });

  fastify.get<{ Params: BookmarkIdParam }>('/detail/:id', {
    schema: bookmarkSchemas.detail,
    handler: (req) => {
      const { currentUser, params } = req;
      return bookmarkService.findOne(currentUser.id, params.id);
    },
  });

  fastify.get<{ Querystring: BookmarkPageListQuery }>('/pageList', {
    schema: bookmarkSchemas.pageList,
    handler: (req) => {
      const { currentUser, query } = req;
      return bookmarkService.pageList(currentUser.id, query);
    },
  });

  fastify.get('/collection', {
    schema: bookmarkSchemas.collection,
    handler: (req) => {
      const { currentUser } = req;
      return bookmarkService.findCollection(currentUser.id);
    },
  });

  fastify.patch<{ Body: UpdateLastVisitTimeBody }>('/visit', {
    schema: bookmarkSchemas.visit,
    handler: (req) => {
      const { currentUser, body } = req;
      return bookmarkService.updateLastVisitTime(currentUser.id, body.id);
    },
  });

  fastify.get<{ Querystring: BookmarkSearchQuery }>('/search', {
    schema: bookmarkSchemas.search,
    handler: (req) => {
      const { currentUser, query } = req;
      return bookmarkService.search(currentUser.id, query.keyword);
    },
  });

  fastify.post<{ Body: BookmarkImportBody }>('/import', {
    schema: bookmarkSchemas.import,
    handler: (req) => {
      const { currentUser, body } = req;
      return bookmarkService.import(currentUser.id, body);
    },
  });

  fastify.get('/export', {
    schema: bookmarkSchemas.export,
    handler: async (req, reply) => {
      try {
        const { currentUser } = req;
        const result = await bookmarkService.export(currentUser.id);

        reply.header('Content-Type', 'application/octet-stream');
        reply.header('Content-Disposition', 'attachment; filename="bookmarks.html"');
        reply.header('X-Response-Type', 'file-stream');
        return Buffer.from(result, 'utf-8');
      } catch (error) {
        req.log.error(error);
        return reply.code(500).send({ error: 'Error exporting bookmarks' });
      }
    },
  });
}
