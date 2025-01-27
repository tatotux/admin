import React, { useState } from 'react';
import { Formik } from 'formik';
import {
  Grid,
  Card,
  Divider,
  TextField,
  Button,
  Input,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@material-ui/core';
import { Link, useHistory } from 'react-router-dom';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import * as Yup from 'yup';
import DateFnsUtils from '@date-io/date-fns';
import { makeStyles } from '@material-ui/core/styles';
import { Breadcrumb } from '../../../../matx';
import bc from '../../../services/breathecode';
import { AsyncAutocomplete } from '../../../components/Autocomplete';
import HelpIcon from '../../../components/HelpIcon';

const slugify = require('slugify')

const useStyles = makeStyles(({ palette }) => ({
  neverEnd: {
    color: palette.text.secondary,
  },
}));

const NewCohort = () => {
  const classes = useStyles();
  const startDate = new Date();
  const [syllabus, setSyllabus] = useState(null);
  const [version, setVersion] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [checked, setChecked] = useState(false);
  const [neverEnd, setNeverEnd] = useState(true);
  const [remote, setRemote] = useState(true);
  const [timeZone, setTimeZone] = useState('');
  const [newCohort, setNewCohort] = useState({
    name: '',
    slug: '',
    language: '',
    kickoff_date: startDate,
    ending_date: null,
    never_ends: false,
    remote_available: true,
    time_zone: '',
  });
  const { academy } = JSON.parse(localStorage.getItem('bc-session'));
  const history = useHistory();
  const languages = [
    {
      value: 'es',
      label: 'Spanish',
    },
    {
      value: 'en',
      label: 'English',
    },
  ];

  const ProfileSchema = Yup.object().shape({
    slug: Yup.string().required().matches(/^[a-z0-9]+(?:(-|_)[a-z0-9]+)*$/, 'Invalid Slug')
  });

  const handleNeverEnd = (event) => {
    setChecked(event.target.checked);
    setNeverEnd(!neverEnd);
    setNewCohort({
      ...newCohort,
      ending_date: null,
      never_ends: true,
    });
  };

  const createCohort = (event) => {
    setNewCohort({
      ...newCohort,
      [event.target.name]: event.target.value,
    });
  };

  const languageCohort = (event) => {
    setNewCohort({
      ...newCohort,
      language: event.target.value,
    });
  };

  const postCohort = (values) => {
    bc.admissions()
      .addCohort({
        ...values,
        timezone: `${timeZone}`,
        syllabus: `${syllabus.slug}.v${version.version}`,
        schedule: schedule?.id,
      })
      .then((data) => {
        if (data.status === 201) {
          history.push('/admissions/cohorts');
        }
      })
      .catch((error) => console.error(error));
  };

  let helpText = `Never ending cohorts don't include functionalities like attendance or cohort calendar. Read more about never ending cohorts by clicking on this help icon.`;
  let helpLink = `https://4geeksacademy.notion.site/About-Never-Ending-cohorts-1c93ee5d61d4466296535ae459cab1ee`;

  return (
    <div className="m-sm-30">
      <div className="mb-sm-30">
        <Breadcrumb
          routeSegments={[
            { name: 'Admin', path: '/admin' },
            { name: 'Cohort', path: '/admissions/cohorts' },
            { name: 'New Cohort' },
          ]}
        />
      </div>

      <Card elevation={3}>
        <div className="flex p-4">
          <h4 className="m-0">Add a New Cohort</h4>
        </div>
        <Divider className="mb-2" />

        <Formik
          initialValues={newCohort}
          onSubmit={(newPostCohort) => postCohort(newPostCohort)}
          enableReinitialize
          validationSchema={ProfileSchema}
        >
          {({ 
            handleSubmit, 
            errors,
            touched, 
          }) => (
            <form className="p-4" onSubmit={handleSubmit}>
              <Grid container spacing={3} alignItems="center">
                <Grid item md={2} sm={4} xs={12}>
                  Cohort Name
                </Grid>
                <Grid item md={10} sm={8} xs={12}>
                  <TextField
                    className="m-2"
                    label="Cohort Name"
                    data-cy="name"
                    name="name"
                    size="small"
                    variant="outlined"
                    value={newCohort.name}
                    onChange={(e)=>{
                      newCohort.slug = slugify(e.target.value).toLowerCase();
                      createCohort(e);
                    }}
                  />
                </Grid>
                <Grid item md={2} sm={4} xs={12}>
                  Cohort Slug
                </Grid>
                <Grid item md={10} sm={8} xs={12}>
                  <TextField
                    className="m-2"
                    label="Cohort Slug"
                    data-cy="slug"
                    name="slug"
                    size="small"
                    variant="outlined"
                    value={newCohort.slug}
                    onChange={createCohort}
                    error={errors.slug && touched.slug}
                    helperText={touched.slug && errors.slug}
                  />
                </Grid>
                <Grid item md={2} sm={4} xs={12}>
                  Syllabus
                </Grid>
                <Grid item md={10} sm={8} xs={12}>
                  <div className="flex flex-wrap m--2">
                    <AsyncAutocomplete
                      debounced={false}
                      onChange={(x) => setSyllabus(x)}
                      width="30%"
                      className="m-4"
                      asyncSearch={() => bc.admissions().getAllSyllabus()}
                      size="small"
                      data-cy="syllabus"
                      label="syllabus"
                      required
                      getOptionLabel={(option) => `${option.name}`}
                      value={syllabus}
                    />
                    {syllabus ? (
                      <AsyncAutocomplete
                        className="m-4"
                        debounced={false}
                        onChange={(v) => setVersion(v)}
                        width="30%"
                        key={syllabus.slug}
                        asyncSearch={() =>
                          bc.admissions().getAllCourseSyllabus(syllabus.slug)
                        }
                        size="small"
                        data-cy="version"
                        label="Version"
                        required
                        getOptionLabel={(option) => option.status === 'PUBLISHED' ? `${option.version}` : "⚠️ "+option.version+" ("+option.status+")"}
                        value={version}
                      />
                    ) : (
                      ''
                    )}
                  </div>
                </Grid>
                <Grid item md={2} sm={4} xs={12}>
                  Schedule
                </Grid>
                <Grid item md={10} sm={8} xs={12}>
                  <AsyncAutocomplete
                    className="m-2"
                    debounced={false}
                    onChange={(v) => setSchedule(v)}
                    width="20%"
                    key={syllabus ? syllabus.slug : ''}
                    asyncSearch={() => {
                      if (!syllabus) {
                        return Promise.resolve([]);
                      }
                      return bc
                        .admissions()
                        .getAllRelatedSchedulesById(syllabus?.id, academy?.id);
                    }}
                    size="small"
                    data-cy="schedule"
                    label="Schedule"
                    required
                    getOptionLabel={(certificate) => `${certificate.name}`}
                    value={schedule}
                    disabled={!syllabus}
                  />
                </Grid>

                <Grid item md={2} sm={4} xs={12}>
                  Language
                </Grid>
                <Grid item md={10} sm={8} xs={12}>
                  <TextField
                    className="m-2"
                    label="Language"
                    data-cy="language"
                    size="small"
                    style={{ width: '20%' }}
                    variant="outlined"
                    value={newCohort.language}
                    onChange={languageCohort}
                    select
                  >
                    {languages.map((option) => (
                      <MenuItem
                        value={option.value}
                        key={option.value}
                        width="40%"
                      >
                        {option.value}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item md={2} sm={4} xs={12}>
                  Start date
                </Grid>
                <Grid item md={10} sm={8} xs={12}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      className="m-2"
                      margin="none"
                      label="Date"
                      inputVariant="outlined"
                      type="text"
                      size="small"
                      data-cy="start-date"
                      autoOk
                      value={newCohort.kickoff_date}
                      format="MMMM dd, yyyy"
                      onChange={(date) =>
                        setNewCohort({
                          ...newCohort,
                          kickoff_date: date,
                        })
                      }
                    />
                  </MuiPickersUtilsProvider>
                </Grid>
                <Grid
                  item
                  md={2}
                  sm={4}
                  xs={12}
                  className={neverEnd ? '' : classes.neverEnd}
                >
                  End date
                </Grid>
                <Grid item md={3} sm={4} xs={6}>
                  <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                      name="endingDate"
                      className="m-2"
                      margin="none"
                      label="End date"
                      data-cy="end-date"
                      inputVariant="outlined"
                      type="text"
                      size="small"
                      value={newCohort.ending_date}
                      format="MMMM dd, yyyy"
                      onChange={(date) =>
                        setNewCohort({
                          ...newCohort,
                          ending_date: date,
                          never_ends: false,
                        })
                      }
                      disabled={!neverEnd}
                      required
                    />
                  </MuiPickersUtilsProvider>
                </Grid>
                <Grid item md={7} sm={4} xs={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={handleNeverEnd}
                        name="endingDate"
                        data-cy="never-ends"
                        color="primary"
                        className="text-left"
                      />
                    }
                    label="This cohort never ends."
                    style={{marginRight:'5px'}}
                  />
                  <HelpIcon message={helpText} link={helpLink} />
                </Grid>
                <Grid item md={12} sm={12} xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={remote}
                        onChange={()=>{
                          setNewCohort({
                            ...newCohort,
                            remote_available:!remote
                          });
                          setRemote(!remote);
                        }}
                        name="remote"
                        data-cy="remote"
                        color="primary"
                        className="text-left"
                      />
                    }
                    label="Enable Remote"
                  />
                </Grid>
                <Grid item md={2} sm={4} xs={12}>
                  Live meeting URL
                </Grid>
                <Grid item md={10} sm={8} xs={12}>
                  <TextField
                    className="m-2"
                    label="URL"
                    width="100%"
                    name="online_meeting_url"
                    data-cy="meetingURL"
                    size="small"
                    variant="outlined"
                    placeholder="https://bluejeans.com/<id>"
                    value={newCohort.online_meeting_url}
                    onChange={createCohort}
                  />
                </Grid>

                <Grid item md={2} sm={4} xs={12}>
                  Timezone
                </Grid>
                <Grid item md={10} sm={8} xs={12}>
                  <div className="flex flex-wrap m--2">
                    <AsyncAutocomplete
                      debounced={false}
                      onChange={(x) => setTimeZone(x)}
                      width="40%"
                      className="m-4"
                      asyncSearch={() => bc.admissions().getAllTimeZone()}
                      size="small"
                      data-cy="timezone"
                      label="Timezone"
                      getOptionLabel={(option) => `${option}`}
                      value={timeZone}
                    />
                  </div>
                </Grid>
              </Grid>
              <div className="mt-6">
                <Button
                  color="primary"
                  variant="contained"
                  type="submit"
                  data-cy="submit"
                >
                  Create
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </Card>
    </div>
  );
};

export default NewCohort;
