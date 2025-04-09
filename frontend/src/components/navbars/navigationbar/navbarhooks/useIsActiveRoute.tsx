import { usePathname } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Hook to determine if a route is active based on the current pathname
 * 
 * @returns A callback function that checks if a given href matches or is a parent of the current route
 * 
 * The hook considers a route active if:
 * - The pathname exactly matches the href
 * - The pathname is a sub-path of the href (for parent routes)
 * - Special case for the root route '/'
 */
export function useIsActiveRoute() {
  const pathname = usePathname();
  
  return useCallback((href: string) => {
    if (!pathname || !href) return false;
    
    // Special case for home route
    if (href === '/') return pathname === '/';
    
    // Normalize paths with trailing slashes for consistent comparison
    const normalizedHref = href.endsWith('/') ? href : `${href}/`;
    const normalizedPathname = pathname.endsWith('/') ? pathname : `${pathname}/`;
    
    // Check for exact match or if current path is a sub-path
    return pathname === href || normalizedPathname.startsWith(normalizedHref);
  }, [pathname]);
}

export default useIsActiveRoute;