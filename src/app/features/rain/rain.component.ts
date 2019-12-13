import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild,
  ElementRef,
  EventEmitter,
  OnDestroy,
  Inject,
} from '@angular/core';
import { RainService } from './rain.service';
import { StreamExecutionService } from '@app/services/stream-execution/stream-execution.service';
import { debounceTime, take, switchMap, filter, map } from 'rxjs/operators';
import { windowProvider, WINDOW } from '@app/shared/providers/window.provider';
import { interval } from 'rxjs';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';
import { DeviceMotionService } from '@app/services/device-motion/device-motion.service';

@Component({
  selector: 'nox-rain',
  templateUrl: './rain.component.html',
  styleUrls: ['./rain.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [StreamExecutionService, DeviceMotionService, windowProvider],
})
export class RainComponent implements OnInit, OnDestroy {
  @ViewChild('renderContainer', { static: true })
  renderContainer: ElementRef;

  windowResized = new EventEmitter<void>();

  loadingProgress$ = this.rainService.state$.spritesLoadingProgress.pipe(
    map(progress =>
      progress < 10 ? `0${progress.toFixed(2)}` : progress.toFixed(2)
    )
  );

  constructor(
    public rainService: RainService,
    private executions: StreamExecutionService,
    private deviceMotionService: DeviceMotionService,
    @Inject(WINDOW) private window: Window
  ) {}

  ngOnInit(): void {
    this.rainService.init({
      container: this.renderContainer.nativeElement,
      containerWidth: this.window.innerWidth,
      containerHeight: this.window.innerHeight,
    });

    this.deviceMotionService.init(this.window);

    this.executions.add(
      this.windowResized.pipe(debounceTime(300)).subscribe(() => {
        this.rainService.resizeContainer(
          this.window.innerWidth,
          this.window.innerHeight
        );
      })
    );

    this.executions.add(
      this.rainService.state$.isStageSetup
        .pipe(
          filter(isStageSetup => isStageSetup),
          take(1),
          switchMap(() => interval(0, animationFrame))
        )
        .subscribe(this.renderLoop.bind(this))
    );

    this.executions.add(
      this.deviceMotionService.onShake.subscribe(() => {
        this.rainService.randomCharacter();
      })
    );
  }

  setIsMouseDown = (isMouseDown: boolean): void => {
    this.rainService.setState({
      isMouseDown,
    });
  };

  renderLoop = (): void => {
    this.rainService.updateDrops();
    this.rainService.updateLightning();
    this.rainService.updateCharacter();

    // this.rainService.updateSpeed();
  };

  ngOnDestroy(): void {
    this.executions.unsubscribe();
    this.deviceMotionService.disconnect();
  }
}
