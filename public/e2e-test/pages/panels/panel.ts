import { TestPage, ClickablePageObjectType, ClickablePageObject, Selector } from '@grafana/toolkit';

export interface Panel {
  panelTitle: ClickablePageObjectType;
  share: ClickablePageObjectType;
}

export const panel = new TestPage<Panel>({
  pageObjects: {
    panelTitle: new ClickablePageObject(Selector.fromAriaLabel('面板标题')),
    share: new ClickablePageObject(Selector.fromAriaLabel('Share panel menu item')),
  },
});
