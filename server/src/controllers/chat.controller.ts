import { Request, Response, NextFunction } from 'express';
import { detectIntent } from '../lib/chatbot/intents';
import {
  handleSearchBooks,
  handleRecommend,
  handleBookmarkAdd,
  handleBookmarkRemove,
  handleFaqRegister,
  handleFaqDownload,
  handleFaqReview,
  handleFaqGeneral,
  handleGreeting,
  handleUnknown,
} from '../lib/chatbot/handlers';

export async function processMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { message } = req.body;
    const { intent, params } = detectIntent(message);

    let response;
    switch (intent) {
      case 'SEARCH_BOOKS':
        response = await handleSearchBooks(params);
        break;
      case 'RECOMMEND':
        response = await handleRecommend(params);
        break;
      case 'BOOKMARK_ADD':
        response = await handleBookmarkAdd(params, req.userId);
        break;
      case 'BOOKMARK_REMOVE':
        response = await handleBookmarkRemove(params, req.userId);
        break;
      case 'FAQ_REGISTER':
        response = handleFaqRegister();
        break;
      case 'FAQ_DOWNLOAD':
        response = handleFaqDownload();
        break;
      case 'FAQ_REVIEW':
        response = handleFaqReview();
        break;
      case 'FAQ_GENERAL':
        response = handleFaqGeneral();
        break;
      case 'GREETING':
        response = handleGreeting();
        break;
      default:
        response = handleUnknown();
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
}
