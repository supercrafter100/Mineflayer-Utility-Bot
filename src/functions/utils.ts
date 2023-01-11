import SysPath from 'path';

/**
 * Checks if a path is absolute, if not the path will be absolute, relative to process.cwd()
 * @param path The absolue path
 */
export function fullPath(path: string): string {
	if(SysPath.isAbsolute(path)) return path;
	return SysPath.join(process.cwd(), path);
}
