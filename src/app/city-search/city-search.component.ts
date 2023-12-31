import {Component, OnInit} from '@angular/core';
import {FormControl, Validators} from "@angular/forms";
import {WeatherService} from "../weather/weather.service";
import {debounceTime, filter, tap} from "rxjs";

@Component({
  selector: 'app-city-search',
  templateUrl: './city-search.component.html',
  styleUrls: ['./city-search.component.css']
})
export class CitySearchComponent {
  search: FormControl = new FormControl('', [Validators.minLength(2)]);

  constructor(private weatherService: WeatherService) {
    this.search.valueChanges.pipe(debounceTime(1000), filter(() => !this.search.invalid), tap((searchValue: string) => this.doSearch(searchValue))).subscribe()
  }

  doSearch(searchValue: string) {
    const userInput = searchValue.split(',').map(s => s.trim())
    const searchText = userInput[0]
    const country = userInput.length > 1 ? userInput[1] : undefined
    this.weatherService.updateCurrentWeather(searchText, country)
  }

  getErrorMessage() {
    return this.search.hasError('minlength') ? "Type more than one character to search" : ""
  }
}
