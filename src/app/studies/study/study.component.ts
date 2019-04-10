import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ScrollTrackerEventData } from '@nicky-lenaers/ngx-scroll-tracker';

import { UserConfigService } from '../../services/user-config.service';
import { StudyRetrieverService } from '../../services/study-retriever.service';
import {
  ContactInterface,
  InterventionInterface,
  InterventionType,
  InvestigatorInterface,
  LocationInterface,
  MeshTermType,
  OutcomeType,
  PersonInterface,
  ProtocolOutcomeInterface,
  RecruitmentStatusType,
  ReferenceInterface,
  ReferenceType,
  RoleType,
  StudyInterface,
  StudyOverallStatus,
  StudyPhase,
  StudyType,
} from '../../interfaces/study.interface';
import { Subscription } from 'rxjs/Rx';
import { AgeRange } from '../../shared/common.interface';
import {
  StudyStatsRetrieverService
} from '../../services/study-stats-retriever.service';
import { intervalToSec } from '../../shared/utils';
import { AuthService } from '../../services/auth.service';
import {
  DescriptorInterface
} from '../../interfaces/descriptor.interface';

@Component({
  selector: 'app-study',
  templateUrl: './study.component.html',
  styleUrls: ['./study.component.scss'],
})
export class StudyComponent implements OnInit, OnDestroy {

  // Index of the navigation pill that's initially active.
  private navPillIndexActive = 0;

  // The study the component will display results for.
  public study: StudyInterface;

  // Placeholder for the study status level.
  public studyStatusLevel: number = null;
  // Placeholder for the study status message.
  public studyStatusMessage: string = null;
  // Placeholder to indicate whether the study officials can be contacted.
  public studyCanContact: boolean = null;
  // Placeholder for the study purpose index.
  public studyPurposeIndex: number = null;
  // Placeholder for the study purpose message.
  public studyPurposeMessage: string = null;
  // Placeholder to indicate whether the study has been saved by the user.
  public isStudySaved: boolean = null;
  // Possible eligibility age-range values in years (to be populated in
  // `ngOnInit`).
  public studyEligibilityAgeRangeAll: AgeRange = {ageBeg: 0, ageEnd: 150};
  public studyEligibilityAgeRange: AgeRange = {ageBeg: 0, ageEnd: 150};
  // Placeholder for the study investigators grouped by their role.
  public studyGroupsInvestigators:
    {[key: string]: InvestigatorInterface[]} = null;
  // Placeholder for the study investigators roles.
  public studyGroupsInvestigatorsRoles: string[] = null;
  // Placeholder for the study outcomes grouped by their type.
  public studyGroupsOutcomes:
    {[key: string]: ProtocolOutcomeInterface[]} = null;
  // Placeholder for the study outcome types.
  public studyGroupsOutcomesTypes: string[] = null;
  // Placeholder for the study references grouped by their type.
  public studyGroupsReferences:
    {[key: string]: ReferenceInterface[]} = null;
  // Placeholder for the study reference types.
  public studyGroupsReferencesTypes: string[] = null;

  // Placeholder for the study condition MeSH terms.
  public studyConditionMeshTerms: DescriptorInterface[] = null;
  // Placeholder for the study intervention MeSH terms.
  public studyInterventionMeshTerms: DescriptorInterface[] = null;
  // Placeholder for the study type index.
  public studyTypeIndex: number = null;
  // Placeholder for the study type message.
  public studyTypeMessage: string = null;
  // Placeholder booleans for the study phase.
  public isStudyPhase1Early: boolean = null;
  public isStudyPhase1: boolean = null;
  public isStudyPhase2: boolean = null;
  public isStudyPhase3: boolean = null;
  public isStudyPhase4: boolean = null;
  // Placeholder for the study phase message.
  public studyPhaseMessage: string = null;

  // Subscription to the observable for the retrieval of the referenced study
  // via GraphQl.
  private subscriptionGetStudyByNctId: Subscription = null;

  constructor(
    public authService: AuthService,
    public userConfigService: UserConfigService,
    public studyRetrieverService: StudyRetrieverService,
    private studyStatsRetrieverService: StudyStatsRetrieverService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    // Retrieve the referenced study NCT ID.
    const studyNctId: string = this.route.snapshot.params['studyNctId'];

    // Retrieve the referenced study.
    this.subscriptionGetStudyByNctId = this.studyRetrieverService
      .getStudiesByNctIds([studyNctId]).subscribe(
        (studies: StudyInterface[]) => {
          this.study = studies[0];
          this.populateConstants();
        }
      );

    // Query out the eligibility age-range of this search's studies to populate
    // the slider range.
    this.studyStatsRetrieverService.getEligibilityAgeRange()
      .subscribe(
      (range: AgeRange) => {
        this.studyEligibilityAgeRangeAll = {
          ageBeg: Math.floor(range.ageBeg / 31536000.0),
          ageEnd: Math.ceil(range.ageEnd / 31536000.0),
        };
      }
    );
  }

  ngOnDestroy() {
    if (this.subscriptionGetStudyByNctId) {
      this.subscriptionGetStudyByNctId.unsubscribe();
    }
  }

  /**
   * Populates all the study constants used in rendering the template.
   */
  populateConstants() {
    // Calculate the study overall-status level.
    this.studyStatusLevel = this.getStatusLevel();
    // Calculate the study overall-status message.
    this.studyStatusMessage = this.getStatusMessage();
    // Define whether the study officials can be contacted.
    this.studyCanContact = this.getCanContact();
    // Calculate the study purpose index.
    this.studyPurposeIndex = this.getPurposeIndex();

    // Calculate the study purpose message.
    if (this.studyPurposeIndex === 1) {
      this.studyPurposeMessage = 'Testing approaches to prevent or provide ' +
        'support for people with this disease';
    } else if (this.studyPurposeIndex === 2) {
      this.studyPurposeMessage = 'Testing approaches to improve or find new ' +
        'ways to identify diseases';
    } else if (this.studyPurposeIndex === 3) {
      this.studyPurposeMessage = 'Testing new approaches to treat diseases';
    } else if (this.studyPurposeIndex === 4) {
      this.studyPurposeMessage = 'Improve current knowledge of diseases';
    }

    // Calculate the eligibility age-range in years.
    this.studyEligibilityAgeRange.ageBeg
      = intervalToSec(this.study.eligibility.minimumAge) / 31536000.0;
    this.studyEligibilityAgeRange.ageEnd
      = intervalToSec(this.study.eligibility.maximumAge) / 31536000.0;

    // Group the study investigators by role and create an array of those roles.
    this.studyGroupsInvestigators = this.groupStudyInvestigators();
    this.studyGroupsInvestigatorsRoles
      = Object.keys(this.studyGroupsInvestigators);

    // Group the study outcomes by type and create an array of those types.
    this.studyGroupsOutcomes = this.groupStudyOutcomes();
    this.studyGroupsOutcomesTypes = Object.keys(this.studyGroupsOutcomes);

    // Group the study references by type and create an array of those types.
    this.studyGroupsReferences = this.groupStudyReferences();
    this.studyGroupsReferencesTypes = Object.keys(this.studyGroupsReferences);

    this.studyConditionMeshTerms = this.getStudyConditionMeshTerms();
    this.studyInterventionMeshTerms = this.getStudyInterventionMeshTerms();

    // Calculate the study type index.
    this.studyTypeIndex = this.getStudyTypeIndex();
    // Calculate the study type message.
    this.studyTypeMessage = this.getStudyTypeMessage();

    // Populate the study phase constants.
    this.populateStudyPhaseConstants();
  }

  /**
   * Retrieves the value of a `StudyOverallStatus` member.
   * @param {StudyOverallStatus} status The enumeration member.
   * @returns {string} The enumeration member value.
   */
  getStatusDescription(status: StudyOverallStatus): string {
    return StudyOverallStatus[status];
  }

  /**
   * Returns a numerical value indicative of the current study's overall status
   * in order appropriately indicate the status of the study in the status
   * timeline.
   * @returns {number} The numerical valud indicative of the study's overall
   * status.
   */
  getStatusLevel() {

    const overallStatus = StudyOverallStatus[this.study.overallStatus];
    
    if (overallStatus === StudyOverallStatus.NOT_YET) {
      return 1;
    } else if (
      overallStatus === StudyOverallStatus.INVITATION ||
      overallStatus === StudyOverallStatus.RECRUITING
    ) {
      return 2;
    } else if (
      overallStatus === StudyOverallStatus.ACTIVE_NOT ||
      overallStatus === StudyOverallStatus.AVAILABLE
    ) {
      return 3;
    } else if (overallStatus === StudyOverallStatus.COMPLETED) {
      return 4;
    } else {
      return 0;
    }
  }

  /**
   * Returns a message explaining the overall status of the currently displayed
   * study depending on the value of its `overallStatus` property.
   * @returns {string | null} The message explaining the overall status of the
   * currently displayed study.
   */
  getStatusMessage(): string | null {

    const overallStatus = StudyOverallStatus[this.study.overallStatus];

    let message: string = null;
    if (overallStatus === StudyOverallStatus.NOT_YET) {
      message = 'This trial will be recruiting participants in the future';
    } else if (overallStatus === StudyOverallStatus.INVITATION) {
      message = 'This trial is currently recruiting participants by ' +
        'invitation only. Even if you meet the criteria to be eligible for ' +
        'the study, you may not be able to participate';
    } else if (overallStatus === StudyOverallStatus.RECRUITING) {
      message = 'This trial is currently recruiting participants';
    } else if (overallStatus === StudyOverallStatus.ACTIVE_NOT) {
      message = 'This trial is underway and no longer recruiting participants';
    } else if (overallStatus === StudyOverallStatus.AVAILABLE) {
      message = 'This trial may be recruiting participants, get in touch ' +
        'with the trial contacts to find out more';
    } else if (overallStatus === StudyOverallStatus.COMPLETED) {
      message = 'This trial is complete and is no longer recruiting ' +
        'participants';
    }

    return message;
  }

  /**
   * Evaluates whether the study officials can be contacted based on the
   * currently displayed study's `overallStudy` property.
   * @returns {boolean} Whether the study officials can be contacted.
   */
  getCanContact(): boolean {
    const overallStatus = StudyOverallStatus[this.study.overallStatus];

    return (
      overallStatus === StudyOverallStatus.NOT_YET ||
      overallStatus === StudyOverallStatus.INVITATION ||
      overallStatus === StudyOverallStatus.RECRUITING ||
      overallStatus === StudyOverallStatus.AVAILABLE
    );
  }

  /**
   * Returns a numerical value indicative of the current study's purpose
   * in order to appropriately indicate.
   * @returns {number} The numerical valud indicative of the study's purpose.
   */
  getPurposeIndex() {
    const purpose = this.study.studyDesignInfo.primaryPurpose;

    if (
      purpose === 'Supportive Care' ||
      purpose === 'Prevention'
    ) {
      return 1;
    } else if (
      purpose === 'Diagnostic' ||
      purpose === 'Screening'
    ) {
      return 2;
    } else if (purpose === 'Treatment') {
      return 3;
    } else if (
      purpose === 'Device Feasibility' ||
      purpose === 'Educational/Counseling/Training' ||
      purpose === 'Other' ||
      purpose === 'Health Services Research' ||
      purpose === 'Basic Science'
    ) {
      return 4;
    } else {
      return 0;
    }
  }

  /**
   * Returns a message explaining the status of a given location.
   * @param {RecruitmentStatusType} status The location status.
   * @returns {string | null} The message explaining the status of a given
   * location
   */
  getLocationStatusMessage(status: RecruitmentStatusType): string | null {

    const locationStatus = RecruitmentStatusType[status];

    let message: string = null;
    if (locationStatus === RecruitmentStatusType.NOT_YET) {
      message = 'This location will be recruiting participants in the future';
    } else if (locationStatus === RecruitmentStatusType.INVITATION) {
      message = 'This location is currently recruiting participants by ' +
        'invitation only';
    } else if (locationStatus === RecruitmentStatusType.RECRUITING) {
      message = 'This location is currently recruiting participants';
    } else if (locationStatus === RecruitmentStatusType.ACTIVE_NOT) {
      message = 'This location is underway and no longer recruiting ' +
        'participants';
    } else if (locationStatus === RecruitmentStatusType.COMPLETED) {
      message = 'This location is no longer recruiting participants';
    }

    return message;
  }

  /**
   * Returns a joined version of a person's full name accounting for null
   * values.
   * @param {PersonInterface} person The person.
   * @returns {string} The person's full name.
   */
  getPersonName(person: PersonInterface): string | null {

    // Assemble an array of all name components.
    let nameComponents: string[] = [
      person.nameFirst,
      person.nameMiddle,
      person.nameLast,
      person.degrees,
    ];
    // Remove all null elements from the array.
    nameComponents = nameComponents
      .filter(x => x != null) as string[];

    // If no non-null elements remain return null.
    if (!nameComponents) {
      return null;
    }

    return nameComponents.join(', ');
  }

  /**
   * Returns a locations contacts accounting for null values.
   * @param {LocationInterface} location The location.
   * @returns {ContactInterface[]} The location's contacts.
   */
  getLocationContacts(location: LocationInterface): ContactInterface[] {

    const contacts: ContactInterface[] = [];

    if (location.contactPrimary) {
      contacts.push(location.contactPrimary);
    }

    if (location.contactBackup) {
      contacts.push(location.contactBackup);
    }

    return contacts;
  }

  /**
   * Groups the currently displayed study's investigators by their role.
   * @returns {{[key: string]: InvestigatorInterface[]}} The study's
   * investigators grouped by their role.
   */
  groupStudyInvestigators(): {[key: string]: InvestigatorInterface[]} {
    const roleTypes = Object.values(RoleType);

    const groupsInvestigators: {[key: string]: InvestigatorInterface[]} = {};

    for (const roleType of roleTypes) {
      if (Object.keys(groupsInvestigators).indexOf(roleType) === -1) {
        groupsInvestigators[roleType] = [];
      }
      for (const investigator of this.study.investigators) {
        if (RoleType[investigator.role] === roleType) {
          groupsInvestigators[roleType].push(investigator);
        }
      }
    }

    return groupsInvestigators;
  }

  /**
   * Groups the currently displayed study's outcomes by their type.
   * @returns {{[key: string]: ProtocolOutcomeInterface[]}} The study's
   * outcomes grouped by their type.
   */
  groupStudyOutcomes(): {[key: string]: ProtocolOutcomeInterface[]} {
    const outcomeTypes = Object.values(OutcomeType);

    const groupsOutcomes: {[key: string]: ProtocolOutcomeInterface[]} = {};

    for (const outcomeType of outcomeTypes) {
      if (Object.keys(groupsOutcomes).indexOf(outcomeType) === -1) {
        groupsOutcomes[outcomeType] = [];
      }
      for (const studyOutcome of this.study.studyOutcomes) {
        if (OutcomeType[studyOutcome.outcomeType] === outcomeType) {
          groupsOutcomes[outcomeType].push(studyOutcome.protocolOutcome);
        }
      }
    }

    return groupsOutcomes;
  }

  /**
   * Groups the currently displayed study's references by their type.
   * @returns {{[key: string]: ReferenceInterface[]}} The study's references
   * grouped by their type.
   */
  groupStudyReferences(): {[key: string]: ReferenceInterface[]} {
    const referenceTypes = Object.values(ReferenceType);

    const groupsReferences: {[key: string]: ReferenceInterface[]} = {};

    for (const referenceType of referenceTypes) {
      if (Object.keys(groupsReferences).indexOf(referenceType) === -1) {
        groupsReferences[referenceType] = [];
      }
      for (const studyReference of this.study.studyReferences) {
        if (ReferenceType[studyReference.referenceType] === referenceType) {
          groupsReferences[referenceType].push(studyReference.reference);
        }
      }
    }

    return groupsReferences;
  }

  /**
   * Returns a message explaining the type of a given outcome.
   * @param {string} outcomeTypeValue The outcome type value.
   * @returns {string | null} The message explaining the type of the given
   * outcome.
   */
  getOutcomeTypeMessage(outcomeTypeValue: string): string {
    let message: string = null;
    if (outcomeTypeValue === OutcomeType.PRIMARY.valueOf()) {
      message = 'These are the most important outcomes from the trial'
    } else if (outcomeTypeValue === OutcomeType.SECONDARY.valueOf()) {
      message = 'These are less important than the primary outcomes'
    } else if (outcomeTypeValue === OutcomeType.POST_HOC.valueOf()) {
      message = 'These outcomes are evaluated after the trial'
    } else if (outcomeTypeValue === OutcomeType.OTHER.valueOf()) {
      message = 'These are other pre-specified outcomes'
    }

    return message;
  }

  /**
   * Returns a message explaining the type of a given reference.
   * @param {string} referenceTypeValue The reference type value.
   * @returns {string | null} The message explaining the type of the given
   * outcome.
   */
  getReferenceTypeMessage(referenceTypeValue: string): string {
    let message: string = null;
    if (referenceTypeValue === ReferenceType.STANDARD.valueOf()) {
      message = 'Papers about the study design'
    } else if (referenceTypeValue === ReferenceType.RESULTS.valueOf()) {
      message = 'Papers about the study results'
    }

    return message;
  }

  /**
   * Returns a boolean denoting whether the currently displayed study is
   * randomized.
   * @returns {boolean} whether the currently displayed study is randomized.
   */
  isStudyRandomized(): boolean {
    return (
      this.study.studyDesignInfo.allocation === 'Randomized' &&
      this.study.studyDesignInfo.interventionModel === 'Parallel Assignment'
    );
  }

  /**
   * Returns all of the currently displayed study's condition MeSH terms.
   * @returns {DescriptorInterface[]} The study's condition MeSH terms.
   */
  getStudyConditionMeshTerms(): DescriptorInterface[] {

    const conditionMeshTerms: DescriptorInterface[] = [];

    for (const studyMeshTerm of this.study.studyDescriptors) {
      if (MeshTermType[studyMeshTerm.studyDescriptorType] === MeshTermType.CONDITION) {
        conditionMeshTerms.push(studyMeshTerm.descriptor)
      }
    }

    return conditionMeshTerms;
  }

  /**
   * Returns all of the currently displayed study's intervention MeSH terms.
   * @returns {DescriptorInterface[]} The study's intervention MeSH terms.
   */
  getStudyInterventionMeshTerms(): DescriptorInterface[] {

    const interventionMeshTerms: DescriptorInterface[] = [];

    for (const studyMeshTerm of this.study.studyDescriptors) {
      if (MeshTermType[studyMeshTerm.studyDescriptorType] === MeshTermType.INTERVENTION) {
        interventionMeshTerms.push(studyMeshTerm.descriptor)
      }
    }

    return interventionMeshTerms;
  }

  /**
   * Returns a numerical value indicative of the current study's type.
   * @returns {number} The numerical valud indicative of the study's type.
   */
  getStudyTypeIndex() {
    const type = StudyType[this.study.studyType];

    if (
      type === StudyType.OBSERVATIONAL ||
      type === StudyType.OBSERVATIONAL_PR
    ) {
      return 1;
    } else if (type === StudyType.INTERVENTIONAL) {
      return 2;
    } else if (type === StudyType.EXPANDED) {
      return 3;
    } else {
      return 4;
    }
  }

  getStudyTypeMessage(): string {
    const type = StudyType[this.study.studyType];

    let message: string = null;
    if (
      type === StudyType.OBSERVATIONAL ||
      type === StudyType.OBSERVATIONAL_PR
    ) {
      message = 'Observational studies follow participants, usually ' +
        'recording information about treatments received by the ' +
        'participant and disease outcomes. These studies usually do not ' +
        'provide any specific disease treatment';
    } else if (type === StudyType.INTERVENTIONAL) {
      message = 'Interventional studies assign participants to groups in ' +
        'which they may receive specific treatments or no treatment at all ' +
        'to evaluate the efficacy of a treatment. See the interventions / ' +
        'treatments section below for more information on these groups';
    } else if (type === StudyType.EXPANDED) {
      message = 'Expanded access trials allow participants who are unable ' +
        'to participate in a clinical trial to access treatments that have ' +
        'not yet been governmentally approved';
    } else if (type === StudyType.NA) {
      message = 'The investigators in this trial have not specified what ' +
        'type of study is included in this trial';
    }

    return message;
  }

  populateStudyPhaseConstants() {
    const phase = StudyPhase[this.study.phase];

    if (phase === StudyPhase.PHASE_1_EARLY) {
      this.isStudyPhase1Early = true;
      this.studyPhaseMessage = 'New drugs and pharmacological treatments (in' +
        ' addition to some other treatment types) must pass through phases of' +
        ' testing to determine if they are safe and effective. Early phase 1 ' +
        'trials do not usually aim to treat participants. Generally, aiming ' +
        'instead to investigate if and how a drug works, potentially ' +
        'including how it affects animals or humans';
    } else if (phase === StudyPhase.PHASE_1) {
      this.isStudyPhase1 = true;
      this.studyPhaseMessage = 'New drugs and pharmacological treatments ' +
        '(in addition to some other treatment types) must pass through ' +
        'phases of testing to determine if they are safe and effective. ' +
        'Phase 1 trials are generally focused on testing the safety of a ' +
        'drug and may not aim to treat participants';
    } else if (phase === StudyPhase.PHASE_2) {
      this.isStudyPhase2 = true;
      this.studyPhaseMessage = 'New drugs and pharmacological treatments (in' +
        ' addition to some other treatment types) must pass through phases ' +
        'of testing to determine if they are safe and effective. Phase 2 ' +
        'trials usually aim to treat diseases while also testing the safety ' +
        'and efficacy of the treatment in general and against other ' +
        'available treatments for the disease';
    } else if (phase === StudyPhase.PHASE_1_2) {
      this.isStudyPhase1 = true;
      this.isStudyPhase2 = true;
      this.studyPhaseMessage = 'New drugs and pharmacological treatments (in' +
        ' addition to some other treatment types) must pass through phases ' +
        'of testing to determine if they are safe and effective. ' +
        'Researchers can combine trial phases to answer questions about ' +
        'the treatment\'s safety or efficacy more quickly or with fewer ' +
        'participants. A phase 1 and 2 combined trial may aim to actively ' +
        'treat diseases while testing the safety and efficacy of the ' +
        'treatment (potentially for the first time)';
    } else if (phase === StudyPhase.PHASE_3) {
      this.isStudyPhase3 = true;
      this.studyPhaseMessage = 'New drugs and pharmacological treatments ' +
        '(in addition to some other treatment types) must pass through ' +
        'phases of testing to determine if they are safe and effective. ' +
        'Phase 3 trials aim to determine a treatment\'s effectiveness and ' +
        'may vary the dosage or administration of the treatment being ' +
        'studied. Phase 3 trials usually involve more participants than ' +
        'earlier phases';
    } else if (phase === StudyPhase.PHASE_2_3) {
      this.isStudyPhase2 = true;
      this.isStudyPhase3 = true;
      this.studyPhaseMessage = 'New drugs and pharmacological treatments ' +
        '(in addition to some other treatment types) must pass through ' +
        'phases of testing to determine if they are safe and effective. ' +
        'Researchers can combine trial phases to answer questions about ' +
        'the treatment\'s safety or efficacy more quickly or with fewer ' +
        'participants. A phase 2 and 3 combined trial will likely aim to ' +
        'treat the disease but may still be testing a treatment\'s safety.';
    } else if (phase === StudyPhase.PHASE_4) {
      this.isStudyPhase4 = true;
      this.studyPhaseMessage = 'New drugs and pharmacological treatments ' +
        '(in addition to some other treatment types) must pass through ' +
        'phases of testing to determine if they are safe and effective. ' +
        'Phase 4 trials use treatments that have been governmentally ' +
        'approved as safe. In phase 4 trials, researchers aim to see how ' +
        'effectively the treatment treats the disease while also ' +
        'collecting information about the optimal use of the treatment';
    }


    if (phase === StudyPhase.PHASE_1 || phase === StudyPhase.PHASE_1_2) {
      this.isStudyPhase1 = true;
      this.studyPhaseMessage = 'New drugs and pharmacological treatments ' +
        '(in addition to some other treatment types) must pass through ' +
        'phases of testing to determine if they are safe and effective. ' +
        'Phase 1 trials are generally focused on testing the safety of a ' +
        'drug and may not aim to treat participants';
    }
    if (
      phase === StudyPhase.PHASE_2 ||
      phase === StudyPhase.PHASE_1_2 ||
      phase === StudyPhase.PHASE_2_3
    ) {
      this.isStudyPhase2 = true;
    }
    if (phase === StudyPhase.PHASE_3 || phase === StudyPhase.PHASE_2_3) {
      this.isStudyPhase3 = true;
    }
    if (phase === StudyPhase.PHASE_4) {
      this.isStudyPhase4 = true;
    }
  }

  /**
   * Returns a numerical value indicative of a given intervention's type.
   * @returns {number} The numerical valud indicative of a given intervention's
   * type.
   */
  getInterventionTypeIndex(intervention: InterventionInterface): number {
    const interventionType = InterventionType[intervention.interventionType];

    if (interventionType === InterventionType.BEHAVIORAL) {
      return 1;
    } else if (interventionType === InterventionType.BIOLOGICAL) {
      return 2;
    } else if (interventionType === InterventionType.COMBINATION) {
      return 3;
    } else if (interventionType === InterventionType.DEVICE) {
      return 4;
    } else if (interventionType === InterventionType.DIAGNOSTIC) {
      return 5;
    } else if (interventionType === InterventionType.DIETARY) {
      return 6;
    } else if (interventionType === InterventionType.DRUG) {
      return 7;
    } else if (interventionType === InterventionType.GENETIC) {
      return 8;
    } else if (interventionType === InterventionType.PROCEDURE) {
      return 9;
    } else if (interventionType === InterventionType.RADIATION) {
      return 10;
    } else if (interventionType === InterventionType.OTHER) {
      return 11;
    } else {
      return 0;
    }
  }


  onOverviewContract() {
    // TODO: Scroll to contact.
  }

  onToggleSavedStudy() {
    // TODO: Toggle saving the study under the user.
  }

  onSeeCitation(pmid: number) {
    // TODO: Redirect to citation page.
  }



  /**
   * Checks whether a nav-pill should receive the `active` class depending on
   * the current scroll position relative to the result cards.
   * @param {ScrollTrackerEventData} event The scroll event containing
   * information regarding the current scroll position.
   * @param {number} navPillIndex The index of the nav-pill that triggered this
   * event/function and will be evaluated for 'activation'.
   */
  public onScroll(event: ScrollTrackerEventData, navPillIndex: number) {
    // Retrieve the ratios between the tracked element and the container.
    const ratioTop = event.data.elementTop.fromContainerTop.ratio;
    const ratioBottom = event.data.elementTop.fromContainerTop.ratio;

    // Should the ratios fall within given ranges the tracked element is
    // in view thus we set `navPillIndexActive` to the current pill index.
    if (
      (ratioTop < 0.1 && ratioTop > -0.75) &&
      (ratioBottom < 0.1 && ratioBottom > -1.75)
    ) {
      this.navPillIndexActive = navPillIndex;
    }
  }

  /**
   * Checks whether a nav-pill with a given index is supposed to be active or
   * not.
   * @param {number} navPillIndex The index of the nav-pill to be checked.
   * @returns {boolean} Whether the defined nav-pill is supposed to be active or
   * not.
   */
  public isNavPillActive(navPillIndex: number) {
    // Check whether the defined nav-pill is supposed to be active or not.
    return navPillIndex === this.navPillIndexActive;
  }

  /**
   * Returns a boolean indicating whether the displayed study is followed by
   * the user.
   * @returns {boolean} Whether the displayed study is followed by the user.
   */
  isStudyFollowed(): boolean {
    return this.userConfigService.getUserStudy(this.study.nctId) !== null;
  }

  /**
   * Toggles the followed state of the displayed study for the current user
   * through the `followStudy` and `unfollowStudy` methods of the
   * `UserConfigService`.
   */
  onToggleFollowStudy(): void {
    if (this.isStudyFollowed()) {
      this.userConfigService.unfollowStudy(
        this.authService.userProfile,
        this.study.nctId,
      );
    } else {
      this.userConfigService.followStudy(
        this.authService.userProfile,
        this.study.nctId,
      );
    }
  }

}
