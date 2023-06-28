import {Component, OnDestroy, OnInit} from '@angular/core';
import {ICurrentWeather} from "../interfaces";
import {WeatherService} from "../weather/weather.service";
import {Observable, Subscription} from "rxjs";

@Component({
  selector: 'app-current-weather',
  templateUrl: './current-weather.component.html',
  styleUrls: ['./current-weather.component.css']
})
export class CurrentWeatherComponent {
  current$: Observable<ICurrentWeather>
  currentWeatherSubscription: Subscription
  constructor(private weatherService: WeatherService) {
    this.current$ = this.weatherService.currentWeather$
  }

}
