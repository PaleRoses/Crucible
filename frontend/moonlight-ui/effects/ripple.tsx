import React, {
    useRef, // Import useRef
    useEffect,
    forwardRef,
    ReactNode,
    ElementType,
    ComponentPropsWithoutRef,
    PropsWithChildren,
    Ref,
    useImperativeHandle,
    RefAttributes,
    ForwardRefExoticComponent,
    MouseEventHandler,
    CSSProperties,
    PointerEventHandler,
    FocusEventHandler,
    KeyboardEventHandler,
  } from 'react';
  // Assuming the hook and its types are correctly imported/available
  import useRippleEffect, {
    RippleEffectOptions,
    RippleEffectResult,
  } from '../hooks/useRippleEffect';
  
  // ========== Constants ==========
  const RIPPLE_BASE_CLASS = 'ml-ui-ripple-container';
  
  // ========== Polymorphic Component Helper Types ==========
  
  type PolymorphicProps<C extends ElementType, Props = {}> = PropsWithChildren<
    Props &
    Omit<ComponentPropsWithoutRef<C>, keyof Props | 'color'> & {
      className?: string;
      style?: CSSProperties;
    }
  >;
  
  type PolymorphicPropsWithAs<
    C extends ElementType,
    Props = {}
  > = PolymorphicProps<C, Props> & { as?: C };
  
  // Using the more flexible PolymorphicRef definition
  type PolymorphicRef<C extends ElementType> = ComponentPropsWithoutRef<C>['ref'];
  
  type PolymorphicForwardRefComponent<
    Props,
    DefaultElement extends ElementType = 'div'
  > = <C extends ElementType = DefaultElement>(
    props: PolymorphicPropsWithAs<C, Props> & { ref?: PolymorphicRef<C> }
  ) => React.ReactElement | null;
  
  
  // ========== Base Ripple Component Types ==========
  
  interface BaseRippleProps {
    // Visual configuration
    color?: string;
    duration?: number;
    opacity?: number;
    scale?: number; // Can be overridden by hook's resolveTheme/scaleVariable
  
    // Behavior configuration
    disabled?: boolean;
    centered?: boolean;
    unbounded?: boolean;
    pulsate?: boolean; // Triggers hook's pulsate method
  
    // Advanced configuration
    autoTrigger?: boolean; // Controls pointerdown listener in hook
    exitDuration?: number;
    /** Options passed directly to the useRippleEffect hook */
    rippleOptions?: Partial<RippleEffectOptions>;
    /** Base z-index for ripple elements (passed via rippleOptions) */
    rippleZIndexBase?: number; // Added for direct control
  
    // API Access
    /** Ref to access the useRippleEffect hook's API */
    rippleApiRef?: React.Ref<RippleEffectResult>; // Use actual hook result type
  
    // Interaction interceptor
    onInteraction?: (event: React.PointerEvent<any> | React.MouseEvent<any>) => boolean | void;
  }
  
  // ========== Main Ripple Component Props ==========
  
  type RippleProps<C extends ElementType = 'div'> = PolymorphicPropsWithAs<
    C,
    BaseRippleProps
  >;
  
  // Adjusted RippleComponent type for broader compatibility
  type RippleComponent = ForwardRefExoticComponent<
    Omit<RippleProps<ElementType>, 'ref'> & RefAttributes<any> // Use ElementType and any
  > & {
    // Static properties can be defined here if needed
  };
  
  
  // ========== Utility Functions ==========
  // Helper to set value on multiple ref types (callback or object)
  function setRef<T>(ref: Ref<T> | undefined, value: T | null): void {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(value);
    } else if (ref && 'current' in ref) {
      // Assign to mutable ref object
      (ref as React.MutableRefObject<T | null>).current = value;
    }
  }
  
  // ========== Main Ripple Component ==========
  /**
   * A polymorphic wrapper component that adds a Material Design-style ripple effect
   * using the provided useRippleEffect hook.
   * It can render as different HTML elements using the `as` prop.
   * Provides refs for both the underlying DOM element (`ref`) and the ripple API (`rippleApiRef`).
   * Base CSS class: `ml-ui-ripple-container`.
   *
   * SSR Safety Note: Assumes useRippleEffect hook is SSR-safe. Component logic
   * primarily uses event handlers which are client-side safe.
   */
  const RippleInner = forwardRef(
    <C extends ElementType = 'div'>(
      props: RippleProps<C>,
      // The ref passed by the consumer via React.forwardRef
      forwardedRef: PolymorphicRef<C>
    ) => {
      const {
        as,
        children,
        disabled = false,
        centered = false,
        unbounded = false,
        pulsate: shouldPulsate = false,
        autoTrigger = true,
        exitDuration,
        rippleOptions = {},
        rippleZIndexBase,
        rippleApiRef,
        onInteraction,
        className,
        style = {},
        onClick,
        onFocus,
        onBlur,
        onKeyDown,
        onKeyUp,
        ...otherProps
      } = props;
  
      const Component = as || 'div';
      // Internal ref to manage the ripple container and hook attachment
      const containerRef = useRef<Element>(null);
  
      // Ref for Space key state tracking
      const wasSpaceDown = useRef(false);
  
      const passDisabledProp = (Component === 'button' || Component === 'input') ? disabled : undefined;
  
      // --- Ref Handling ---
      // Use imperative handle is primarily for exposing methods, not merging DOM refs.
      // We handle merging below in React.createElement.
      // useImperativeHandle(forwardedRef, () => containerRef.current as any); // This isn't quite right for DOM refs
  
      const combinedRippleOptions: RippleEffectOptions = {
        isEnabled: !disabled,
        autoTrigger: autoTrigger,
        color: props.color,
        duration: props.duration,
        opacity: props.opacity,
        maxScale: props.scale,
        exitDuration: exitDuration,
        rippleZIndexBase: rippleZIndexBase,
        ...rippleOptions,
      };
  
      const ripple = useRippleEffect(
          // Pass the internal ref to the hook
          containerRef as React.RefObject<HTMLElement>,
          combinedRippleOptions
      );
  
      useEffect(() => {
        if (rippleApiRef) {
          setRef(rippleApiRef, ripple);
        }
      }, [ripple, rippleApiRef]);
  
      useEffect(() => {
        if (!ripple) return;
        if (shouldPulsate) {
          ripple.pulsate?.('start');
        } else {
          ripple.pulsate?.('stop');
        }
        return () => {
          const currentRipple = ripple;
          currentRipple?.pulsate?.('stop');
        };
      }, [shouldPulsate, ripple]);
  
  
      const handleInteraction: PointerEventHandler<C> = (event) => {
        if (event.button !== 0 || disabled) return;
        let proceed = true;
        if (onInteraction) {
            const result = onInteraction(event);
            if (result === false) proceed = false;
        }
        if (proceed && ripple && !autoTrigger) {
            if (centered) {
                const element = containerRef.current;
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    ripple.triggerRippleAt?.(centerX, centerY);
                }
            } else {
               ripple.triggerRippleAt?.(event.clientX, event.clientY);
            }
        }
      };
  
      const handleFocus: FocusEventHandler<C> = (event) => {
          if (onFocus) onFocus(event);
          if (disabled || !ripple) return;
  
          const target = event.currentTarget;
          let isKeyboardFocus = false;
          try {
              if (target instanceof Element) {
                  isKeyboardFocus = target.matches(':focus-visible');
              }
          } catch (e) {
              console.warn('":focus-visible" check failed.', e);
          }
  
          if (isKeyboardFocus) {
              const element = containerRef.current;
              if (element) {
                  const rect = element.getBoundingClientRect();
                  const centerX = rect.left + rect.width / 2;
                  const centerY = rect.top + rect.height / 2;
                  ripple.triggerRippleAt?.(centerX, centerY);
                  console.log('Focus-visible: Triggered ripple at center via triggerRippleAt.');
              }
          }
      };
  
      const handleBlur: FocusEventHandler<C> = (event) => {
          if (onBlur) onBlur(event);
          wasSpaceDown.current = false; // Reset space key flag on blur
          if (disabled || !ripple) return;
          console.log('Blur: No specific ripple action needed unless hook implements distinct focus ripple.');
      };
  
      const handleKeyDown: KeyboardEventHandler<C> = (event) => {
          if (onKeyDown) onKeyDown(event);
          if (disabled || !ripple) return;
  
          if (event.key === 'Enter') {
              const element = containerRef.current;
              if (element) {
                  const rect = element.getBoundingClientRect();
                  const centerX = rect.left + rect.width / 2;
                  const centerY = rect.top + rect.height / 2;
                  ripple.triggerRippleAt?.(centerX, centerY);
                  console.log('Enter pressed: Triggered ripple at center via triggerRippleAt.');
              }
          } else if (event.key === ' ') {
              if (!wasSpaceDown.current) {
                  wasSpaceDown.current = true;
                  // event.preventDefault(); // Optional: Prevent scroll
                  console.log('Space down: Flag set.');
              }
          }
      };
  
      const handleKeyUp: KeyboardEventHandler<C> = (event) => {
          if (onKeyUp) onKeyUp(event);
          if (disabled || !ripple) return;
  
          if (event.key === ' ') {
              if (wasSpaceDown.current) {
                  wasSpaceDown.current = false;
                  const element = containerRef.current;
                  if (element) {
                      const rect = element.getBoundingClientRect();
                      const centerX = rect.left + rect.width / 2;
                      const centerY = rect.top + rect.height / 2;
                      ripple.triggerRippleAt?.(centerX, centerY);
                      console.log('Space up: Triggered ripple via triggerRippleAt.');
                      // (event.currentTarget as HTMLElement)?.click(); // Optional: Trigger click
                  }
              }
          }
      };
  
      const getDefaultDisplay = (): CSSProperties['display'] | undefined => {
          if (typeof Component === 'string') {
              switch(Component) {
                  case 'button': case 'a': return 'inline-flex';
                  case 'div': case 'span': case 'li': return 'inline-block';
                  default: return undefined;
              }
          }
          return 'inline-block';
      };
      const defaultDisplay = getDefaultDisplay();
  
      const containerStyle: CSSProperties = {
        position: 'relative',
        display: style?.display ?? defaultDisplay,
        overflow: unbounded ? 'visible' : 'hidden',
        alignItems: (style?.display ?? defaultDisplay)?.includes('flex') ? 'center' : undefined,
        justifyContent: (style?.display ?? defaultDisplay)?.includes('flex') ? 'center' : undefined,
        ...style,
      };
      const combinedClassName = `${RIPPLE_BASE_CLASS} ${className || ''}`.trim();
  
      return React.createElement(
        Component,
        {
          // --- Fix: Forward Ref Correctly ---
          // Use a callback ref to assign the node to both the internal containerRef
          // and the external forwardedRef passed by the consumer.
          ref: (node: Element | null) => { // Ensure node type is handled (can be null)
              setRef(containerRef, node); // Assign to internal ref for hook
              setRef(forwardedRef, node); // Assign to the forwarded ref for consumer
          },
          className: combinedClassName,
          style: containerStyle,
          onClick: onClick,
          onPointerDown: handleInteraction,
          onFocus: handleFocus,
          onBlur: handleBlur,
          onKeyDown: handleKeyDown,
          onKeyUp: handleKeyUp,
          disabled: passDisabledProp,
          'aria-disabled': !passDisabledProp && disabled ? true : undefined,
          ...otherProps,
        },
        children
      );
    }
  );
  
  export const Ripple = RippleInner as RippleComponent;
  Ripple.displayName = 'Ripple';
  
  
  // ========== RippleSurface Component ==========
  
  interface RippleSurfaceProps extends Omit<BaseRippleProps, 'unbounded'> {
      children?: ReactNode;
      className?: string;
      style?: CSSProperties;
      onClick?: MouseEventHandler<HTMLDivElement>;
      onFocus?: FocusEventHandler<HTMLDivElement>;
      onBlur?: FocusEventHandler<HTMLDivElement>;
      onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
      onKeyUp?: KeyboardEventHandler<HTMLDivElement>;
  }
  
  export const RippleSurface = forwardRef<HTMLDivElement, RippleSurfaceProps>(
    (props, ref) => {
      const { children, style, className, ...rest } = props;
      const surfaceStyle: CSSProperties = {
        display: 'block', width: '100%', position: 'relative',
        overflow: 'hidden',
        ...style,
      };
      // The ref passed here will be correctly forwarded by the underlying Ripple component
      return (
        <Ripple ref={ref} as="div" style={surfaceStyle} className={className} unbounded={false} {...rest}>
          {children}
        </Ripple>
      );
    }
  );
  RippleSurface.displayName = 'RippleSurface';
  
  // ========== Controlled Ripple Component ==========
  
  interface ControlledRippleItem {
    id: string;
    x?: number | string;
    y?: number | string;
    scale?: number;
    opacity?: number;
    color?: string;
    size?: number | string;
    duration?: number | string;
    zindex?: number;
  }
  type ControlledRippleUpdatePayload = Partial<Omit<ControlledRippleItem, 'id'>>;
  
  export interface ControlledRippleProps
    extends Omit<BaseRippleProps, 'autoTrigger' | 'centered' | 'pulsate'> {
    ripples: ControlledRippleItem[];
    onRippleRemoved?: (id: string) => void;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
    onClick?: MouseEventHandler<HTMLDivElement>;
    onFocus?: FocusEventHandler<HTMLDivElement>;
    onBlur?: FocusEventHandler<HTMLDivElement>;
    onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
    onKeyUp?: KeyboardEventHandler<HTMLDivElement>;
  }
  
  export const ControlledRipple = forwardRef<HTMLDivElement, ControlledRippleProps>(
    (props, ref) => {
      const {
        ripples = [], onRippleRemoved, children, rippleOptions = {},
        style = {}, className,
        onClick, onFocus, onBlur, onKeyDown, onKeyUp,
        rippleApiRef,
        rippleZIndexBase,
        ...rest
      } = props;
  
      const containerRef = useRef<HTMLDivElement>(null);
      const createdRipplesRef = useRef(new Set<string>());
      const ripplesToDestroy = useRef(new Map<string, number>());
  
      // Use imperative handle for the ControlledRipple itself, forwarding to its container div
      useImperativeHandle(ref, () => containerRef.current!, []);
  
      const combinedRippleOptions: RippleEffectOptions = {
        ...rippleOptions,
        autoTrigger: false,
        onRippleExpire: onRippleRemoved,
        rippleZIndexBase: rippleZIndexBase,
        color: props.color,
        duration: props.duration,
        opacity: props.opacity,
        maxScale: props.scale,
      };
  
      const ripple = useRippleEffect(containerRef, combinedRippleOptions);
  
      useEffect(() => {
        if (!ripple) return;
        const currentRippleIds = new Set<string>(ripples.map(r => r.id));
        const existingRippleIds = createdRipplesRef.current;
  
        ripples.forEach((item: ControlledRippleItem) => {
          const { id, ...styleVars } = item;
          const initialStyleVars = Object.entries(styleVars).reduce((acc, [key, value]) => {
              acc[key] = String(value);
              return acc;
          }, {} as Record<string, string>);
  
          if (!existingRippleIds.has(id)) {
            existingRippleIds.add(id);
            if (ripplesToDestroy.current.has(id)) {
                clearTimeout(ripplesToDestroy.current.get(id));
                ripplesToDestroy.current.delete(id);
            }
            ripple.triggerRippleControlled?.(id, initialStyleVars);
          } else {
            if (ripplesToDestroy.current.has(id)) {
                clearTimeout(ripplesToDestroy.current.get(id));
                ripplesToDestroy.current.delete(id);
                initialStyleVars.scale = initialStyleVars.scale ?? '1';
                initialStyleVars.opacity = initialStyleVars.opacity ?? '0.5';
            }
            ripple.updateRipple?.(id, initialStyleVars);
          }
        });
  
        existingRippleIds.forEach((id: string) => {
          if (!currentRippleIds.has(id) && !ripplesToDestroy.current.has(id)) {
            const exitDuration = combinedRippleOptions.exitDuration ?? 150;
            ripple.updateRipple?.(id, { scale: '0', opacity: '0', duration: `${exitDuration}ms` });
            const timeoutId = window.setTimeout(() => {
              ripple.destroyRipple?.(id);
              existingRippleIds.delete(id);
              ripplesToDestroy.current.delete(id);
            }, exitDuration);
            ripplesToDestroy.current.set(id, timeoutId);
          }
        });
      }, [ripples, ripple, combinedRippleOptions]);
  
  
      useEffect(() => {
        return () => {
          if (ripple) {
            ripplesToDestroy.current.forEach(clearTimeout);
            ripplesToDestroy.current.clear();
            createdRipplesRef.current.forEach((id: string) => {
              ripple.destroyRipple?.(id);
            });
            createdRipplesRef.current.clear();
          }
        };
      }, [ripple]);
  
      const controlledStyle: CSSProperties = {
          position: 'relative', overflow: 'hidden',
          display: 'block',
          ...style,
      };
      const combinedClassName = `${RIPPLE_BASE_CLASS} ${className || ''}`.trim();
  
      // Render using the main Ripple component as a container.
      // The ref passed here is for the *ControlledRipple* component itself (handled by useImperativeHandle above).
      // The internal containerRef of this Ripple instance is used by the hook.
      return (
        <Ripple
          ref={containerRef} // This ref is for the hook inside ControlledRipple
          as="div"
          className={combinedClassName}
          style={controlledStyle}
          autoTrigger={false}
          pulsate={false}
          rippleApiRef={rippleApiRef} // Pass API ref if consumer needs access
          rippleZIndexBase={rippleZIndexBase}
          onClick={onClick}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
          {...rest}
        >
          {children}
        </Ripple>
      );
    }
  );
  ControlledRipple.displayName = 'ControlledRipple';
  
  // Named exports
  export { useRippleEffect };  