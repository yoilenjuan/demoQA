import { allure } from 'allure-playwright';

/**
 * Allure Utilities for enhanced reporting
 */
export class AllureUtils {
  
  /**
   * Add test case information
   */
  static testCase(id: string, title: string, description?: string): void {
    allure.testCaseId(id);
    allure.displayName(title);
    if (description) {
      allure.description(description);
    }
  }

  /**
   * Add test categorization
   */
  static categorize(epic: string, feature: string, story: string): void {
    allure.epic(epic);
    allure.feature(feature);
    allure.story(story);
  }

  /**
   * Add severity level
   */
  static severity(level: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'): void {
    allure.severity(level);
  }

  /**
   * Add test tags
   */
  static tags(...tags: string[]): void {
    tags.forEach(tag => allure.tag(tag));
  }

  /**
   * Add links for traceability
   */
  static links(issue?: string, tms?: string, custom?: { name: string; url: string }[]): void {
    if (issue) {
      allure.issue(issue, `https://jira.company.com/browse/${issue}`);
    }
    if (tms) {
      allure.tms(tms, `https://tms.company.com/test/${tms}`);
    }
    if (custom) {
      custom.forEach(link => allure.link(link.url, link.name, 'custom'));
    }
  }

  /**
   * Add test owner
   */
  static owner(name: string): void {
    allure.owner(name);
  }

  /**
   * Add custom labels
   */
  static labels(labels: { [key: string]: string }): void {
    Object.entries(labels).forEach(([key, value]) => {
      allure.label(key, value);
    });
  }

  /**
   * Add test step with automatic timing
   */
  static async step<T>(name: string, body: () => Promise<T> | T): Promise<T> {
    return await allure.step(name, body);
  }

  /**
   * Add parameters to current test
   */
  static parameters(params: { [key: string]: any }): void {
    Object.entries(params).forEach(([key, value]) => {
      allure.parameter(key, typeof value === 'object' ? JSON.stringify(value) : value);
    });
  }

  /**
   * Attach data to current test
   */
  static attach(name: string, content: string | Buffer, type: string = 'text/plain'): void {
    allure.attachment(name, content, type);
  }

  /**
   * Attach JSON data
   */
  static attachJSON(name: string, data: any): void {
    allure.attachment(name, JSON.stringify(data, null, 2), 'application/json');
  }

  /**
   * Start a step (for manual step management)
   */
  static startStep(name: string): void {
    allure.startStep(name);
  }

  /**
   * End current step
   */
  static endStep(): void {
    allure.endStep();
  }
}

/**
 * Decorator for automatic test case setup
 */
export function TestCase(options: {
  id: string;
  title?: string;
  description?: string;
  epic?: string;
  feature?: string;
  story?: string;
  severity?: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';
  owner?: string;
  tags?: string[];
  issues?: string[];
}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // Setup test case info
      AllureUtils.testCase(options.id, options.title || propertyName, options.description);
      
      if (options.epic || options.feature || options.story) {
        AllureUtils.categorize(
          options.epic || 'Default Epic',
          options.feature || 'Default Feature', 
          options.story || 'Default Story'
        );
      }
      
      if (options.severity) {
        AllureUtils.severity(options.severity);
      }
      
      if (options.owner) {
        AllureUtils.owner(options.owner);
      }
      
      if (options.tags) {
        AllureUtils.tags(...options.tags);
      }
      
      if (options.issues) {
        options.issues.forEach(issue => {
          allure.issue(issue, `https://jira.company.com/browse/${issue}`);
        });
      }
      
      // Execute the original method
      return await method.apply(this, args);
    };
    
    return descriptor;
  };
}

export default AllureUtils;