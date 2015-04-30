import classnames from 'classnames'

import React from 'react'
import {Link} from 'react-router'

import {Radio, Panes, Form} from '../../../form'

import './project-config.less'
import '../lib/form.less'

export default class ProjectConfig extends React.Component {
  constructor(props) {
    super(props)
  }

  onSubmit(data, action) {
    this.props.onClose()
    this.props.onSubmit(data, action)
  }

  renderClearButton() {
    if (!this.props.onClear) return
    let text = 'Clear Cache'
    let disabled = false
    if (this.props.cacheStatus === true) {
      text = 'Clearing...'
      disabled = true
    } else if (this.props.cacheStatus) {
      text = 'Try Again'
    }
    return <button
      className='Button ProjectConfig_clear'
      type='button'
      disabled={disabled}
      onClick={this.props.onClear}>
      {text}
    </button>
  }

  render() {
    return <Form className='ProjectConfig' initialData={this.props.project} onSubmit={this.onSubmit.bind(this)}>
      <Panes
        formPass={true}
        defaultPane='general'
        panes={{
          general: 'General',
          plugins: 'Plugins',
        }}
      >
        <div paneId='general'>
          <div className='ProjectConfig_top'>
            <label className='text-label ProjectConfig_name'>Project Name
              <input type='text' className='ProjectConfig_name' name="name" title="Name" placeholder="Project name"/>
            </label>

            <div className='ProjectConfig_buttons'>
              <button className='Button'>{this.props.actionText}</button>
              {this.renderClearButton()}
            </div>
          </div>
          {sourceConfig()}
          {buildConfig()}
          {testConfig()}
        </div>
        <div paneId='plugins'>
          Plugins!!!
          {pluginConfig()}
        </div>
      </Panes>
    </Form>
  }
}

const defaultProviderData = {
  git: {
    provider: 'git',
    config: {
      repo: 'https://github.com/you/yours',
    }
  },
  script: {
    provider: 'script',
    config: {
      base: 'ubuntu',
      get: '# get some data',
      update: '# update the project',
    }
  }
}

function makeProviderConfig(provider) {
  if (provider === 'git') {
    return <div>
      <label className='text-label'>
        Git Repo
        <input type='text' className='mono-text' name='config.repo' placeholder="Git repo"/>
      </label>
    </div>
  }
  if (provider !== 'script') {
    return <span>Unconfigurable</span>
  }
  return <div>
    <label className='text-label'>
      Docker image
      <input type='text' className='mono-text' name='config.base' placeholder="Docker image"/>
    </label>
    <label className='text-label'>
      Shell command to get the project
      <input type='text' className='mono-text' name='config.get' placeholder='Shell command to get data'/>
    </label>
    <label className='text-label'>
      Shell command to update the project
      <input type='text' className='mono-text' name='config.update' placeholder='Shell command to update data'/>
    </label>
  </div>
}

function sourceConfig() {
  return <Radio
    name='source'
    title='Source'
    choices={{local: 'Local path', provider: 'Provider'}}
    switchOn={val => val.get('path') ? 'local' : 'provider'}
    defaultData={{
      local: {path: '/', inPlace: false},
      provider: {provider: 'git', config: {repo: 'https://github.com/you/yours'}}
    }}
  >
    <div switchWhere='local' >
      <label className='ProjectConfig_source-local text-label'>
        Local path:
        <input type='text' name='path' placeholder="local path to project"/>
      </label>
      <label className='checkbox-label'>
        <input type='checkbox' name='inPlace'/>
        Mount on filesystem (don't copy into a container)
      </label>
    </div>
    <Radio
      name=''
      switchWhere='provider'
      className='ProjectConfig_source-provider'
      title='Provider'
      choices={{
        git: 'Git Repo',
        script: 'Bash script',
      }}
      defaultData={defaultProviderData}
      switchOn='provider'
      body={current => makeProviderConfig(current)}/>
  </Radio>
}

function buildConfig() {
  return <Radio
    name='build'
    title='Build Step'
    choices={{
      file: 'From Dockerfile',
      prefab: 'From prefab image',
    }}
    defaultData={{
      file: {dockerfile: 'Dockerfile', context: true, noRebuild: false},
      prefab: {prefab: 'docker-ci/node'}
    }}
    switchOn={val => {
      if (val === true) return 'file'
      if (typeof val === 'string') return 'file'
      return val.get('dockerfile') ? 'file' : 'prefab'
    }}>
    <div switchWhere='file' className='ProjectConfig_dockerfile'>
      <label className='text-label'>
        Dockerfile location (within project):
        <input className='mono-text' type='text' name="dockerfile" placeholder="Dockerfile"/>
      </label>
      <Radio
        name='context'
        title='Context'
        choices={{
          none: 'No context',
          full: 'Full project',
          path: 'Subdirectory',
        }}
        switchOn={val => {
          if (val === true) return 'full'
          if (val === false) return 'none'
          return 'path'
        }}
        defaultData={{
          full: true,
          none: false,
          path: 'some/subdir',
        }}
        >
        <input switchWhere='path' className='mono-text' name='' type='text' placeholder='some/directory'/>
      </Radio>
      <label className='checkbox-label'>
        <input type="checkbox" name="noRebuild"/>
        Reuse previously built image if available
      </label>
    </div>
    <div switchWhere='prefab' classname='ProjectConfig_prefab'>
      <label className='text-label'>Docker image name: <input type='text' name="prefab" placeholder="ubuntu:latest"/></label>
    </div>
  </Radio>
}

function testConfig() {
  return <section className='ProjectConfig_section'>
    <div className='section-title'>Test Step</div>
    <div className='ProjectConfig_section_body'>
      <label className='text-label'>Working Directory
        <input type='text' name='test.cwd'/>
      </label>
      <label className='text-label'>Test Command
        <textarea name='test.cmd'/>
      </label>
    </div>
  </section>
}

class GitPlugin extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <div className='GitPlugin'>
    <h1>Git Post-Commit hook</h1>
    <pre style={{whiteSpace: 'pre-wrap'}}>echo "curl -X POST http://localhost:3005/api/builds/{this.props.value.get('id')}" >> .git/hooks/post-commit && chmod +x .git/hooks/post-commit</pre>
    </div>
  }
}

function pluginConfig() {
  return <div>
    <GitPlugin name='*'/>
  </div>
}
