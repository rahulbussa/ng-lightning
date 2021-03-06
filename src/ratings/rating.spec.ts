import {TestBed, ComponentFixture}  from '@angular/core/testing';
import {Component} from '@angular/core';
import {NglRating} from './rating';
import {NglRatingsModule} from './module';
import {createGenericTestComponent, dispatchKeyEvent, dispatchEvent } from '../../test/util/helpers';
import {By} from '@angular/platform-browser';

const createTestComponent = (html?: string) =>
  createGenericTestComponent(TestComponent, html) as ComponentFixture<TestComponent>;

function getStars(element: HTMLElement): HTMLElement[] {
  return [].slice.call(element.querySelectorAll('ngl-icon'));
}

function getICons(element: HTMLElement): SVGElement[] {
  return [].slice.call(element.querySelectorAll('svg'));
}

function dispatchKey(fixture: ComponentFixture<any>, key: string) {
  dispatchKeyEvent(fixture, By.directive(NglRating), `keydown.${key}`);
}

function expectState(element: HTMLElement, state: string) {
  const stars = getICons(element);
  expect(stars.length).toBe(state.length);
  expect(+element.firstElementChild.getAttribute('aria-valuemax')).toBe(state.length);
  expect(+element.firstElementChild.getAttribute('aria-valuenow')).toBe((state.match(/\*/g) || []).length);
  expect(stars.map(icon => icon.classList.contains('slds-icon-text-warning') ? '*' : '-').join('')).toBe(state);
}

describe('Rating Component', () => {

  beforeEach(() => TestBed.configureTestingModule({declarations: [TestComponent], imports: [NglRatingsModule]}));

  it('should render the stars correctly', () => {
    const fixture = createTestComponent();
    const { nativeElement, componentInstance } = fixture;
    expectState(nativeElement, '**---');

    componentInstance.value = 4;
    fixture.detectChanges();
    expectState(nativeElement, '****-');
  });

  it('should change rate based on click', () => {
    const fixture = createTestComponent();
    const { nativeElement, componentInstance } = fixture;

    const stars = getStars(nativeElement);
    expect(componentInstance.change).not.toHaveBeenCalled();

    stars[1].click();
    expect(componentInstance.change).not.toHaveBeenCalled();

    stars[3].click();
    expect(componentInstance.change).toHaveBeenCalledWith(4);
  });

  it('should notify when hovering over a specific rate', () => {
    const fixture = createTestComponent(`<ngl-rating [rate]="value" (hover)="change($event)"></ngl-rating>`);
    const { nativeElement, componentInstance } = fixture;

    const stars = getStars(nativeElement);
    expect(componentInstance.change).not.toHaveBeenCalled();

    dispatchEvent(stars[3], 'mouseenter');
    expect(componentInstance.change).toHaveBeenCalledWith(4);

    dispatchEvent(stars[0], 'mouseenter');
    expect(componentInstance.change).toHaveBeenCalledWith(1);
  });

  describe(`max`, () => {
    it('defines the available stars', () => {
      const fixture = createTestComponent(`<ngl-rating rate="5" max="10"></ngl-rating>`);
      expectState(fixture.nativeElement, '*****-----');
    });
  });

  it('should not change when is readonly', () => {
    const fixture = createTestComponent();
    const { nativeElement, componentInstance } = fixture;
    componentInstance.readonly = true;
    fixture.detectChanges();

    const stars = getStars(nativeElement);
    expect(componentInstance.change).not.toHaveBeenCalled();

    stars[3].click();
    expect(componentInstance.change).not.toHaveBeenCalled();
  });

  it('should not change when is readonly', () => {
    const fixture = createTestComponent();
    const { nativeElement, componentInstance } = fixture;
    componentInstance.readonly = true;
    fixture.detectChanges();

    const stars = getStars(nativeElement);
    expect(componentInstance.change).not.toHaveBeenCalled();

    stars[3].click();
    expect(componentInstance.change).not.toHaveBeenCalled();
  });

  describe('keyboard interaction', () => {
    it('will change value apropriately', () => {
      const fixture = createTestComponent();
      const { componentInstance } = fixture;

      expect(componentInstance.change).not.toHaveBeenCalled();

      dispatchKey(fixture, 'ArrowUp');
      expect(componentInstance.change).toHaveBeenCalledWith(3);
      dispatchKey(fixture, 'ArrowDown');
      expect(componentInstance.change).toHaveBeenCalledWith(1);

      componentInstance.change.calls.reset();

      dispatchKey(fixture, 'ArrowRight');
      expect(componentInstance.change).toHaveBeenCalledWith(3);
      dispatchKey(fixture, 'ArrowLeft');
      expect(componentInstance.change).toHaveBeenCalledWith(1);
    });

    it('will keep value in limits', () => {
      const fixture = createTestComponent();
      const { componentInstance } = fixture;
      componentInstance.value = 5;
      fixture.detectChanges();

      dispatchKey(fixture, 'ArrowUp');
      expect(componentInstance.change).not.toHaveBeenCalled();

      componentInstance.value = 1;
      fixture.detectChanges();
      dispatchKey(fixture, 'ArrowDown');
      expect(componentInstance.change).not.toHaveBeenCalled();
    });
  });

  it('should change icons size based on input', () => {
    const fixture = createTestComponent(`<ngl-rating [(rate)]="value" [size]="size"></ngl-rating>`);
    const { nativeElement, componentInstance } = fixture;
    componentInstance.size = 'small';
    fixture.detectChanges();

    const icons = getICons(nativeElement);
    icons.forEach(icon => expect(icon).toHaveCssClass('slds-icon--small'));

    componentInstance.size = 'large';
    fixture.detectChanges();
    icons.forEach(icon => {
      expect(icon).not.toHaveCssClass('slds-icon--small');
      expect(icon).toHaveCssClass('slds-icon--large');
    });

    componentInstance.size = null;
    fixture.detectChanges();
    icons.forEach(icon => {
      expect(icon).not.toHaveCssClass('slds-icon--small');
      expect(icon).not.toHaveCssClass('slds-icon--large');
    });
  });

});

@Component({
  template: `<ngl-rating [rate]="value" (rateChange)="change($event)" [isReadonly]="readonly"></ngl-rating>`,
})
export class TestComponent {
  value = 2;
  readonly = false;
  size: string;
  change = jasmine.createSpy('change');
}
