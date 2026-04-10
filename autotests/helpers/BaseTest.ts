import { Page } from '@playwright/test';
import { ApiHelper } from './api';
import { DbHelper } from './db';

/**
 * Base class for PRECONDITIONS: creates all test data via API.
 * Subclasses encapsulate setup logic and expose created resources.
 */
export abstract class BasePreconditions {
  protected api: ApiHelper;
  protected db: DbHelper;

  constructor(api: ApiHelper) {
    this.api = api;
    this.db = new DbHelper();
  }

  abstract setup(): Promise<void>;
}

/**
 * Base class for TEST: contains UI actions and assertions.
 * Receives page and optionally api for tests that need API access.
 */
export abstract class BaseTest {
  protected page: Page;
  protected api: ApiHelper;
  protected db: DbHelper;

  constructor(page: Page, api?: ApiHelper) {
    this.page = page;
    this.api = api!;
    this.db = new DbHelper();
  }

  abstract execute(): Promise<void>;
}

/**
 * Base class for POSTCONDITIONS: cleans up all data created in preconditions via API.
 * Uses try/finally internally so cleanup always runs.
 */
export abstract class BasePostconditions {
  protected api: ApiHelper;

  constructor(api: ApiHelper) {
    this.api = api;
  }

  abstract cleanup(): Promise<void>;
}
