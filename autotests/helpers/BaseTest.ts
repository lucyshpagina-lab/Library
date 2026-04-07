import { Page } from '@playwright/test';
import { ApiHelper } from './api';

export abstract class BaseTest {
  protected page: Page;
  protected api: ApiHelper;

  constructor(page: Page, api?: ApiHelper) {
    this.page = page;
    this.api = api || new ApiHelper();
  }

  abstract preconditions(): Promise<void>;
  abstract test(): Promise<void>;
  abstract postconditions(): Promise<void>;
}
