import {observer} from "mobx-react";
import {HttpExchange} from "../../model/http/exchange";
import {useState} from "react";
import {describeEventCategory, EventCategory, getSummaryColour} from "../../model/events/categorization";
import {StatusCode} from "../common/status-code";
import {Icon, WarningIcon} from "../../icons";
import {nameHandlerClass} from "../../model/rules/rule-descriptions";
import * as React from "react";
import {styled} from "../../styles";
import {filterProps} from "../component-utils";

const EventListRow = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;

    user-select: none;
    cursor: pointer;

    &.malicious-low {
        background-color: lightgrey;
    }
    &.malicious-medium {
        background-color: orange;
    }
    &.malicious-high {
        background-color: red;
    }

    &.selected {
        background-color: ${p => p.theme.highlightBackground};
        font-weight: bold;
    }

    &:focus {
        outline: thin dotted ${p => p.theme.popColor};
    }

`;

const Column = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 3px 0;
`;

const Status = styled(Column)`
    flex-basis: 45px;
    flex-shrink: 0;
    flex-grow: 0;
`;

const Host = styled(Column)`
    flex-shrink: 1;
    flex-grow: 0;
    flex-basis: 500px;
`;

const PathAndQuery = styled(Column)`
    flex-shrink: 1;
    flex-grow: 0;
    flex-basis: 1000px;
`;

const Source = styled(Column)`
    flex-basis: 49px;
    flex-shrink: 0;
    flex-grow: 0;
    text-align: center;
`;

const Method = styled(Column)`
    transition: flex-basis 0.1s;
    ${(p: { pinned?: boolean }) =>
    p.pinned
        ? 'flex-basis: 50px;'
        : 'flex-basis: 71px;'
}

    flex-shrink: 0;
    flex-grow: 0;
`;

const RowMarker = styled(Column)`
    transition: color 0.2s;
    color: ${(p: { category: EventCategory }) => getSummaryColour(p.category)};

    background-color: currentColor;

    flex-basis: 5px;
    flex-shrink: 0;
    flex-grow: 0;
    height: 100%;
    padding: 0;

    border-left: 5px solid ${p => p.theme.containerBackground};
`;
const RowPin = styled(
    filterProps(Icon, 'pinned')
).attrs((p: { pinned: boolean }) => ({
    icon: ['fas', 'thumbtack'],
    title: p.pinned ? "This exchange is pinned, and won't be deleted by default" : ''
}))`
    font-size: 90%;
    background-color: ${p => p.theme.containerBackground};

    /* Without this, 0 width pins create a large & invisible but still clickable icon */
    overflow: hidden;

    transition: width 0.1s, padding 0.1s, margin 0.1s;

    ${(p: { pinned: boolean }) =>
    p.pinned
        ? `
            width: auto;
            padding: 8px 7px;
            && { margin-right: -3px; }
        `
        : `
            padding: 8px 0;
            width: 0 !important;
            margin: 0 !important;
        `
}
`;

const TrafficEventListRow = styled(EventListRow)`
    background-color: ${props => props.theme.mainBackground};

    border-width: 2px 0;
    border-style: solid;
    border-color: transparent;
    background-clip: padding-box;
    box-sizing: border-box;

    &.malicious-low {
        background-color: lightgrey;
    }
    &.malicious-medium {
        background-color: orange;
    }
    &.malicious-high {
        background-color: red;
    }

    &:hover ${RowMarker}, &.selected ${RowMarker} {
        border-color: currentColor;
    }

    > * {
        margin-right: 10px;
    }
`;


const ExchangeRow = observer(({
                                  index,
                                  isSelected,
                                  style,
                                  exchange
                              }: {
    index: number,
    isSelected: boolean,
    style: {},
    exchange: HttpExchange
}) => {

    const getSeverity = (maliciousArray:Array<any>) => {
        return maliciousArray[0]?.severity;
    }


    const {
        request,
        response,
        pinned,
        category,
        securityChecks
    } = exchange;

    const className = (onlyCritical: boolean): string => {
        let classString= '';
        if (securityChecks.length){
            const color = getSeverity(securityChecks)
            classString += onlyCritical ? color === 'high' ? "malicious-high" : "malicious-"+ color : "malicious-"+ color;
        }

        if (isSelected) {
            classString += " selected";
        }

        return classString
    }
    const [showOnlyCritical,setShowOnlyCritical] = useState(false)

    return (
        <>
            <button onClick={() => {
                return  setShowOnlyCritical(true)
            }
            }>HELOOOOO</button>
            <TrafficEventListRow
                role="row"
                aria-label='row'
                aria-rowindex={index + 1}
                data-event-id={exchange.id}
                tabIndex={isSelected ? 0 : -1}
                className={className(showOnlyCritical)}
                style={style}
            >
                <RowPin pinned={pinned}/>
                <RowMarker category={category} title={describeEventCategory(category)} />
                <Method pinned={pinned}>{ request.method }</Method>
                <Status>
                    {
                        response === 'aborted'
                            ? <StatusCode status={'aborted'} />
                            : exchange.isBreakpointed
                                ? <WarningIcon title='Breakpointed, waiting to be resumed' />
                                : exchange.isWebSocket() && response?.statusCode === 101
                                    ? <StatusCode // Special UI for accepted WebSockets
                                        status={exchange.closeState
                                            ? 'WS:closed'
                                            : 'WS:open'
                                        }
                                        message={`${exchange.closeState
                                            ? 'A closed'
                                            : 'An open'
                                        } WebSocket connection`}
                                    />
                                    : <StatusCode
                                        status={response?.statusCode}
                                        message={response?.statusMessage}
                                    />
                    }
                </Status>
                <Source>
                    <Icon
                        title={request.source.summary}
                        {...request.source.icon}
                        fixedWidth={true}
                    />
                    {
                        exchange.matchedRule &&
                        exchange.matchedRule.handlerStepTypes.some(t =>
                            t !== 'passthrough' && t !== 'ws-passthrough' && t !== 'rtc-dynamic-proxy'
                        ) &&
                        <Icon
                            title={`Handled by ${
                                exchange.matchedRule.handlerStepTypes.length === 1
                                    ? nameHandlerClass(exchange.matchedRule.handlerStepTypes[0])
                                    : 'multi-step'
                            } rule`}
                            icon={['fas', 'theater-masks']}
                            color={getSummaryColour('mutative')}
                            fixedWidth={true}
                        />
                    }
                </Source>
                <Host title={ request.parsedUrl.host }>
                    { request.parsedUrl.host }
                </Host>
                <PathAndQuery title={ request.parsedUrl.pathname + request.parsedUrl.search }>
                    { request.parsedUrl.pathname + request.parsedUrl.search }
                </PathAndQuery>
            </TrafficEventListRow>;
        </>
    )

});
export default ExchangeRow
