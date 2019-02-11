// @flow
import { type Dispatch } from 'redux';
import { type SubscriptionProduct } from 'helpers/subscriptions';
import { sendClickedEvent } from 'helpers/tracking/clickTracking';

export type Action<P> = { type: 'SET_PLAN', plan: P, scope: string };

function ProductPagePlanFormActionsFor<P:string>(scope: string, product: SubscriptionProduct | null) {
  function setPlan(plan: P): (dispatch: Dispatch<Action<P>>) => Action<P> {
    return (dispatch) => {
      if (product) {
        sendClickedEvent(`${product}-toggle_plan-${plan}`)();
      }
      return dispatch({ type: 'SET_PLAN', plan, scope });
    };
  }

  return { setPlan };
}

export { ProductPagePlanFormActionsFor };
