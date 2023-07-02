import json
import os.path
from argparse import ArgumentParser

import exifread


def dms2dd(degrees: float, minutes: float, seconds: float, direction: str) -> float:
    """
    Converts a coordinate from degrees, minutes and seconds to decimal degrees

    :param degrees:     The coordinate degrees (°)
    :param minutes:     The coordinate minutes (")
    :param seconds:     The coordinate seconds (')
    :param direction:   Single-char capital direction sign, one of {N, S, E, W}

    :return: the coordinate as a single float
    """
    dd = float(degrees) + float(minutes)/60 + float(seconds)/(60*60)

    if direction == 'E' or direction == 'S':
        dd *= -1

    return dd


def main(directory: str, output_path) -> None:
    if not os.path.isdir(directory):
        raise NotADirectoryError(f'Please provide a path to an existing directory, got {directory}')

    geojson = {
        'type': 'FeatureCollection',
        'features': []
    }

    supported_formats = ['.TIFF', '.TIF', '.JPEG', '.JPG', '.PNG', '.WEBP', '.HEIC']
    base_url = '/public/'

    for _, _, filenames in os.walk(directory):
        for filename in filenames:
            _, extension = os.path.splitext(filename)
            if extension.upper() not in supported_formats:
                continue

            with open(os.path.join(directory, filename), 'rb') as f:
                exif = exifread.process_file(f)

            # Easting
            lon = exif['GPS GPSLongitude']
            lon_ref = exif['GPS GPSLongitudeRef']
            lon_as_decimal = dms2dd(float(lon.values[0]), float(lon.values[1]), float(lon.values[2]), lon_ref)

            lat = exif['GPS GPSLatitude']
            lat_ref = exif['GPS GPSLatitudeRef'].values
            lat_as_decimal = dms2dd(float(lat.values[0]), float(lat.values[1]), float(lat.values[2]), lat_ref)

            geojson['features'].append({
                'type': 'Feature',
                'properties': {'image': f'{base_url}{filename}'},
                'geometry': {
                    'type': 'Point',
                    'coordinates': [
                        lon_as_decimal,
                        lat_as_decimal,
                    ]
                }
            })

    with open(output_path, 'wt') as f:
        f.write(json.dumps(geojson, indent=2))

    print('Done!')


if __name__ == '__main__':
    parser = ArgumentParser('Extracts a geojson of coordinates and file names from a directory of geotagged images')
    parser.add_argument('-d', '--directory', required=True)
    parser.add_argument('-o', '--output', required=True)

    args = parser.parse_args()
    raise SystemExit(main(args.directory, args.output))
