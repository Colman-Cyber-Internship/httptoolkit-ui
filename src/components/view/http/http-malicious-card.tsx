import * as _ from "lodash";
import * as React from "react";
import { observer } from "mobx-react";
import { get } from "typesafe-get";

import { HtkResponse, InputSecurityCheck } from "../../../types";
import { Theme } from "../../../styles";

import { ApiExchange } from "../../../model/api/api-interfaces";
import { getStatusColor } from "../../../model/events/categorization";
import { getStatusDocs, getStatusMessage } from "../../../model/http/http-docs";

import {
  CollapsibleCard,
  CollapsibleCardProps,
  CollapsibleCardHeading,
} from "../../common/card";
import { Pill } from "../../common/pill";
import { HeaderDetails } from "./header-details";
import {} from "../../common/card";
import {
  CollapsibleSection,
  CollapsibleSectionSummary,
  CollapsibleSectionBody,
} from "../../common/collapsible-section";
import {
  ContentLabel,
  ContentLabelBlock,
  ExternalContent,
  Markdown,
} from "../../common/text-content";
import { DocsLink } from "../../common/docs-link";

interface MaliciousProps extends CollapsibleCardProps {
  maliciousObject: InputSecurityCheck[];
}
export const HttpMaliciousCard = observer((props: MaliciousProps) => {
  const { collapsed, expanded, maliciousObject } = props;
  let content;
  if (maliciousObject.length) {
    content = (
      <div>
        <p>
          <ContentLabel>HTTP Packet id:</ContentLabel>
          {maliciousObject[0]?.id}
        </p>
        <p>
          <ContentLabel>Severity:</ContentLabel>
          {maliciousObject[0]?.severity}
        </p>
        <p>
          <ContentLabel>Description:</ContentLabel>
          {maliciousObject[0]?.statusMessage}
        </p>
      </div>
    );
  } else {
    content = <div>No malicious object</div>;
  }

  return (
    <CollapsibleCard {...props} direction="left">

      <header>
        {/* <Pill color={getStatusColor(response.statusCode, theme)}>{
              response.statusCode
          }</Pill> */}
        <CollapsibleCardHeading onCollapseToggled={props.onCollapseToggled}>
          Malicious
        </CollapsibleCardHeading>
      </header>

      <div>
        <div>{content}</div>
      </div>
    </CollapsibleCard>
  );
});
