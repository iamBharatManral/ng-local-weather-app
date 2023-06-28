import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {ICurrentWeather} from "../interfaces";
import {Observable, map, BehaviorSubject, switchMap} from "rxjs";
import {IPostalCode, PostalCodeService} from "../postal-code/postal-code.service";

interface ICurrentWeatherData {
  weather: [{
    description: string,
    icon: string
  }],
  main: {
    temp: number
  },
  sys: {
    country: string
  },
  dt: number,
  name: string
}

interface Coordinates {
  latitude: number,
  longitude: number
}

export interface IWeatherService {
  readonly currentWeather$: BehaviorSubject<ICurrentWeather>

  getCurrentWeather(search: string, country?: string): Observable<ICurrentWeather>

  getCurrentWeatherByCoords(coords: Coordinates): Observable<ICurrentWeather>

  updateCurrentWeather(
    search: string,
    country?: string
  ): void
}

@Injectable({
  providedIn: 'root'
})

export class WeatherService implements IWeatherService {
  readonly currentWeather$ = new BehaviorSubject<ICurrentWeather>({
    city: '--',
    country: '--',
    date: Date.now(),
    image: 'assets/img/sunny.png',
    temperature: 0,
    description: ''
  })

  constructor(private httpClient: HttpClient, private postalCodeService: PostalCodeService) {
  }

  getCurrentWeather(searchText: string | number, country?: string): Observable<ICurrentWeather> {
    return this.postalCodeService.
    resolvePostalCode(searchText)
      .pipe(
        switchMap((postalCode: IPostalCode | null) => {
          if (postalCode) {
            return this.getCurrentWeatherByCoords({
              latitude: postalCode.lat,
              longitude: postalCode.lng,
            } as Coordinates)
          } else {
            const uriParams = new HttpParams().set(
              'q',
              country ? `${searchText},${country}` : searchText
            )
            return this.getCurrentWeatherHelper(uriParams)
          }
        })
      )
  }

  updateCurrentWeather(search: string, country?: string) {
    this.getCurrentWeather(search, country).subscribe(weather => this.currentWeather$.next(weather))
  }

  private getCurrentWeatherHelper(uriParams: HttpParams): Observable<ICurrentWeather> {
    uriParams = uriParams.set('appid', environment.appId)
    return this.httpClient.get<ICurrentWeatherData>(
      `${environment.baseUrl}api.openweathermap.org/data/2.5/weather?`, {params: uriParams}
    ).pipe(map(data => this.transformToICurrentWeather(data)))
  }

  private transformToICurrentWeather(data: ICurrentWeatherData): ICurrentWeather {
    return {
      city: data.name,
      country: data.sys.country,
      date: data.dt * 1000,
      image: `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
      temperature: this.convertKelvinToDegrees(data.main.temp),
      description: data.weather[0].description
    }
  }

  getCurrentWeatherByCoords(coords: Coordinates): Observable<ICurrentWeather> {
    const uriParams = new HttpParams().set("lat", coords.latitude.toString()).set("lon", coords.longitude.toString())
    return this.getCurrentWeatherHelper(uriParams)
  }

  private convertKelvinToFahrenheit(kelvin: number): number {
    return kelvin * 9 / 5 - 459.67
  }
  private convertKelvinToDegrees(kelvin: number):  number{
    return kelvin - 273.15
  }
}
